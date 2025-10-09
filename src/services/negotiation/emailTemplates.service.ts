/**
 * @fileoverview Email templates service for Step 44
 * @module services/negotiation/emailTemplates
 */

export const COUNTER_TEMPLATES = {
  baseRaise: {
    subject: 'Offer discussion — Base and equity alignment',
    body: `
<p>Hi {{Name}},</p>
<p>Thank you for the offer for the {{Role}} role. I'm excited about the team and the impact. Based on scope and market data, I'd like to discuss aligning base to <b>{{AskBaseCurrency}} {{AskBase}}</b> and equity to <b>{{AskEquityShares}}</b> RSUs. I've included a brief rationale below:</p>
<ul>{{Bullets}}</ul>
<p>Happy to jump on a call — {{Timeslot}} works on my end.</p>
<p>Best,<br>{{Sender}}</p>`
  },
  signOn: {
    subject: 'Offer discussion — Sign-on consideration',
    body: `
<p>Hi {{Name}},</p>
<p>Appreciate the offer. To support the transition, could we include a sign-on of <b>{{AskCurrency}} {{AskSignOn}}</b>?</p>
<ul>{{Bullets}}</ul>
<p>Thanks,<br>{{Sender}}</p>`
  }
};
