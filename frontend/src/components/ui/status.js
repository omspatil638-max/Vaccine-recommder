import {
  CheckCircle2,
  CircleSlash,
  HelpCircle,
  MessageCircleWarning,
  MinusCircle,
  ShieldCheck,
  FlaskConical,
} from 'lucide-react';

/**
 * Recommendation / data statuses. Meaning is carried by icon + text, colour is
 * reinforcement only. Keys match the engine's status codes.
 */
export const STATUS = {
  RECOMMENDED: { label: 'Recommended', tone: 'ok', icon: CheckCircle2 },
  MAY_BE_APPROPRIATE: { label: 'May be appropriate', tone: 'ok', icon: CheckCircle2 },
  UP_TO_DATE: { label: 'Up to date', tone: 'ok', icon: ShieldCheck },
  REVIEW_WITH_PROFESSIONAL: {
    label: 'Talk to a healthcare professional',
    tone: 'caution',
    icon: MessageCircleWarning,
  },
  CONTRAINDICATION: { label: 'Not recommended for you right now', tone: 'stop', icon: CircleSlash },
  INSUFFICIENT_INFORMATION: { label: 'More information needed', tone: 'info', icon: HelpCircle },
  NOT_INDICATED: { label: 'Not currently indicated', tone: 'neutral', icon: MinusCircle },
  DEMO: { label: 'Demo data', tone: 'demo', icon: FlaskConical },
};
