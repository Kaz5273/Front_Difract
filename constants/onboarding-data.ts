import { ImageSourcePropType } from 'react-native';

export type UserRole = 'public' | 'artist';

export interface ChoiceOption {
  role: UserRole;
  label: string;
  subtitle: string;
  image: ImageSourcePropType;
  slideTitle: Array<{ text: string; bold?: boolean }>;
}

export interface OnboardingSlide {
  id: string;
  type?: 'welcome' | 'choice' | 'default';
  title: Array<{ text: string; bold?: boolean }>;
  description: string;
  image: ImageSourcePropType;
  backgroundImage?: ImageSourcePropType;
  choices?: ChoiceOption[];
  forRole?: UserRole;
}

export const ONBOARDING_SLIDES: OnboardingSlide[] = [
  {
    id: '1',
    type: 'welcome',
    title: [],
    description: '',
    image: require('@/assets/images/LogoDifract.png'),
    backgroundImage: require('@/assets/images/onbo1.png'),
  },
  {
    id: '2',
    type: 'choice',
    title: [],
    description: '',
    image: require('@/assets/images/onbo1.png'),
    backgroundImage: require('@/assets/images/onbo1.png'),
    choices: [
      {
        role: 'public',
        label: 'Public',
        subtitle: 'Explorer, voter, vibrer',
        image: require('@/assets/images/onboChoix1.png'),
        slideTitle: [
          { text: 'Vivez les ', bold: true },
          { text: 'événements', bold: false },
        ],
      },
      {
        role: 'artist',
        label: 'Artiste',
        subtitle: 'Postuler, gagner, jouer',
        image: require('@/assets/images/onboChoix2.png'),
        slideTitle: [
          { text: 'Participer aux ', bold: true },
          { text: 'événements', bold: false },
        ],
      },
    ],
  },
  // --- Slides pour Utilisateur (public) ---
  {
    id: 'public-1',
    forRole: 'public',
    title: [
      { text: 'Contribuer à la\n', bold: true },
      { text: 'programmation', bold: false },
    ],
    description: '',
    image: require('@/assets/images/onbo2.png'),
    backgroundImage: require('@/assets/images/onbo2.png'),
  },
  {
    id: 'public-2',
    forRole: 'public',
    title: [
      { text: 'Suivez les ', bold: true },
      { text: 'votes et soutenez vos artistes locaux préférés', bold: false },
    ],
    description: '',
    image: require('@/assets/images/Votes 3.png'),
    backgroundImage: require('@/assets/images/onbo3.png'),
  },
  {
    id: 'public-3',
    forRole: 'public',
    title: [
      { text: 'Vivez les ', bold: true },
      { text: 'événements', bold: false },
    ],
    description: '',
    image: require('@/assets/images/scene.png'),
    backgroundImage: require('@/assets/images/onbo4.png'),
  },
  // --- Slides pour Artiste ---
  {
    id: 'artist-1',
    forRole: 'artist',
    title: [
      { text: 'Postuler à des\n', bold: true },
      { text: 'événements', bold: false },
    ],
    description: '',
    image: require('@/assets/images/onbo2.png'),
    backgroundImage: require('@/assets/images/onboar1.png'),
  },
  {
    id: 'artist-2',
    forRole: 'artist',
    title: [
      { text: 'Gagner les votes', bold: true },
      { text: ' et passez sur scène', bold: false },
    ],
    description: '',
    image: require('@/assets/images/Votes 3.png'),
    backgroundImage: require('@/assets/images/onboar2.png'),
  },
  {
    id: 'artist-3',
    forRole: 'artist',
    title: [
      { text: 'Faites vibrer ', bold: true },
      { text: 'la scène', bold: false },
    ],
    description: '',
    image: require('@/assets/images/scene.png'),
    backgroundImage: require('@/assets/images/onboar3.png'),
  },
];
