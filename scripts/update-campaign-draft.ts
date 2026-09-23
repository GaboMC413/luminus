import fs from 'fs';
import path from 'path';
import { renderBelenEducacionSexualNewsletterHtml } from '../apps/platform/lib/mails/belenEducacionSexualNewsletter';

const campaignsPath = path.join(__dirname, '..', '.local-data', 'email-marketing', 'campaigns.json');
const raw = fs.readFileSync(campaignsPath, 'utf-8');
const campaigns = JSON.parse(raw);

const target = campaigns.find((c: any) => c.id === 'cmp_1790118100900_melca');
if (target) {
  target.subject = '[LUMINUS NEWS] Algo para llevarte esta semana';
  target.previewText = 'Una mirada sobre educación sexual, vínculos y bienestar.';
  target.htmlContent = renderBelenEducacionSexualNewsletterHtml();
  fs.writeFileSync(campaignsPath, JSON.stringify(campaigns, null, 2), 'utf-8');
  console.log('Campaign updated with latest square image template!');
} else {
  console.error('Target campaign not found!');
}
