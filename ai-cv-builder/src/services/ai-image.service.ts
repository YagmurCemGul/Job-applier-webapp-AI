// We'll use Replicate API (Stable Diffusion) or OpenAI DALL-E
// For this example, we'll create a flexible service that supports both

export interface AIImageGenerationOptions {
  prompt: string
  negativePrompt?: string
  width?: number
  height?: number
  numImages?: number
  seed?: number
}

export interface AIImageResult {
  url: string
  seed?: number
}

export type AIProvider = 'openai' | 'replicate' | 'stability'

class AIImageService {
  private provider: AIProvider
  private apiKey: string

  constructor(provider: AIProvider = 'openai') {
    this.provider = provider
    this.apiKey = this.getApiKey(provider)
  }

  private getApiKey(provider: AIProvider): string {
    switch (provider) {
      case 'openai':
        return import.meta.env.VITE_OPENAI_API_KEY || ''
      case 'replicate':
        return import.meta.env.VITE_REPLICATE_API_KEY || ''
      case 'stability':
        return import.meta.env.VITE_STABILITY_API_KEY || ''
      default:
        return ''
    }
  }

  // Generate professional LinkedIn photo from selfie
  async generateLinkedInPhoto(
    imageBase64: string,
    style: 'professional' | 'business' | 'casual' | 'creative' = 'professional'
  ): Promise<AIImageResult[]> {
    const stylePrompts = {
      professional:
        'professional corporate headshot, business attire, clean background, studio lighting, high quality, sharp focus, professional photographer style',
      business:
        'business professional portrait, formal suit, office background, natural lighting, confident pose, executive style',
      casual:
        'business casual portrait, smart casual attire, neutral background, soft lighting, approachable and friendly',
      creative:
        'creative professional headshot, modern style, artistic background, dynamic lighting, innovative and unique',
    }

    const prompt = `professional LinkedIn profile photo, ${stylePrompts[style]}, photorealistic, 4k, high detail`
    const negativePrompt =
      'cartoon, anime, illustration, painting, drawing, art, sketch, low quality, blurry, distorted, deformed, amateur, unprofessional, casual selfie, filters, watermark'

    switch (this.provider) {
      case 'openai':
        return this.generateWithOpenAI(imageBase64, prompt)
      case 'replicate':
        return this.generateWithReplicate(imageBase64, prompt, negativePrompt)
      case 'stability':
        return this.generateWithStability(imageBase64, prompt, negativePrompt)
      default:
        throw new Error('Invalid AI provider')
    }
  }

  // OpenAI DALL-E 3 (Edit/Variation)
  private async generateWithOpenAI(
    imageBase64: string,
    prompt: string
  ): Promise<AIImageResult[]> {
    try {
      // Convert base64 to blob
      const response = await fetch(imageBase64)
      const blob = await response.blob()

      // Create FormData
      const formData = new FormData()
      formData.append('image', blob, 'image.png')
      formData.append('prompt', prompt)
      formData.append('n', '4') // Generate 4 variations
      formData.append('size', '1024x1024')

      // Call OpenAI API
      const result = await fetch('https://api.openai.com/v1/images/edits', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: formData,
      })

      if (!result.ok) {
        throw new Error(`OpenAI API error: ${result.statusText}`)
      }

      const data = await result.json()
      return data.data.map((item: any) => ({ url: item.url }))
    } catch (error) {
      console.error('OpenAI generation error:', error)
      throw error
    }
  }

  // Replicate API (Stable Diffusion img2img)
  private async generateWithReplicate(
    imageBase64: string,
    prompt: string,
    negativePrompt: string
  ): Promise<AIImageResult[]> {
    try {
      // Call Replicate API
      const response = await fetch('https://api.replicate.com/v1/predictions', {
        method: 'POST',
        headers: {
          Authorization: `Token ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          version:
            'stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b',
          input: {
            image: imageBase64,
            prompt: prompt,
            negative_prompt: negativePrompt,
            num_outputs: 4,
            guidance_scale: 7.5,
            num_inference_steps: 50,
            prompt_strength: 0.8,
          },
        }),
      })

      if (!response.ok) {
        throw new Error(`Replicate API error: ${response.statusText}`)
      }

      const prediction = await response.json()

      // Poll for results
      let result = prediction
      while (result.status !== 'succeeded' && result.status !== 'failed') {
        await new Promise((resolve) => setTimeout(resolve, 1000))
        const pollResponse = await fetch(
          `https://api.replicate.com/v1/predictions/${prediction.id}`,
          {
            headers: {
              Authorization: `Token ${this.apiKey}`,
            },
          }
        )
        result = await pollResponse.json()
      }

      if (result.status === 'failed') {
        throw new Error('Image generation failed')
      }

      return result.output.map((url: string) => ({ url }))
    } catch (error) {
      console.error('Replicate generation error:', error)
      throw error
    }
  }

  // Stability AI API
  private async generateWithStability(
    imageBase64: string,
    prompt: string,
    negativePrompt: string
  ): Promise<AIImageResult[]> {
    try {
      // Convert base64 to blob
      const response = await fetch(imageBase64)
      const blob = await response.blob()

      const formData = new FormData()
      formData.append('init_image', blob)
      formData.append('init_image_mode', 'IMAGE_STRENGTH')
      formData.append('image_strength', '0.35')
      formData.append('text_prompts[0][text]', prompt)
      formData.append('text_prompts[0][weight]', '1')
      formData.append('text_prompts[1][text]', negativePrompt)
      formData.append('text_prompts[1][weight]', '-1')
      formData.append('cfg_scale', '7')
      formData.append('samples', '4')
      formData.append('steps', '50')

      const result = await fetch(
        'https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/image-to-image',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            Accept: 'application/json',
          },
          body: formData,
        }
      )

      if (!result.ok) {
        throw new Error(`Stability API error: ${result.statusText}`)
      }

      const data = await result.json()
      return data.artifacts.map((artifact: any) => ({
        url: `data:image/png;base64,${artifact.base64}`,
        seed: artifact.seed,
      }))
    } catch (error) {
      console.error('Stability generation error:', error)
      throw error
    }
  }

  // Text to image (for other use cases)
  async generateImage(options: AIImageGenerationOptions): Promise<AIImageResult[]> {
    const {
      prompt,
      negativePrompt = '',
      width = 1024,
      height = 1024,
      numImages = 1,
    } = options

    switch (this.provider) {
      case 'openai':
        return this.generateTextToImageOpenAI(prompt, numImages)
      case 'replicate':
        return this.generateTextToImageReplicate(prompt, negativePrompt, numImages)
      default:
        throw new Error('Text-to-image not supported for this provider')
    }
  }

  private async generateTextToImageOpenAI(
    prompt: string,
    numImages: number
  ): Promise<AIImageResult[]> {
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt,
        n: numImages,
        size: '1024x1024',
        quality: 'hd',
      }),
    })

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`)
    }

    const data = await response.json()
    return data.data.map((item: any) => ({ url: item.url }))
  }

  private async generateTextToImageReplicate(
    prompt: string,
    negativePrompt: string,
    numImages: number
  ): Promise<AIImageResult[]> {
    const response = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        Authorization: `Token ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        version:
          'stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b',
        input: {
          prompt,
          negative_prompt: negativePrompt,
          num_outputs: numImages,
        },
      }),
    })

    const prediction = await response.json()

    // Poll for results
    let result = prediction
    while (result.status !== 'succeeded' && result.status !== 'failed') {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      const pollResponse = await fetch(
        `https://api.replicate.com/v1/predictions/${prediction.id}`,
        {
          headers: {
            Authorization: `Token ${this.apiKey}`,
          },
        }
      )
      result = await pollResponse.json()
    }

    if (result.status === 'failed') {
      throw new Error('Image generation failed')
    }

    return result.output.map((url: string) => ({ url }))
  }
}

// Export singleton instance
export const aiImageService = new AIImageService(
  (import.meta.env.VITE_AI_PROVIDER as AIProvider) || 'openai'
)