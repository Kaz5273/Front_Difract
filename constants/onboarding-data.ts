import { ImageSourcePropType } from 'react-native';

export interface OnboardingSlide {
  id: string;
  title: Array<{ text: string; bold?: boolean }>;
  description: string;
  image: ImageSourcePropType;
}

export const ONBOARDING_SLIDES: OnboardingSlide[] = [
  {
    id: '1',
    title: [
      { text: 'Bienvenue sur ', bold: true }
    ],
    description: 'Découvrez et participez aux événements autour de vous',
    image: require('@/assets/images/LogoDifract.png'),
  },
  {
    id: '2',
   title: [
      { text: 'Contribuez à la ', bold: true},
      { text: 'programmation', bold: false }
    ],
    description: 'Exprimez votre opinion et influencez les événements à venir',
    image: require('@/assets/images/Votes 2.png'),
  },
  {
    id: '3',
    title: [
      { text: 'Suivez le ', bold: true },
      { text: 'vote et soutenez vos artistes locaux préférés', bold: false }
    ],
    description: 'Trouvez des événements qui correspondent à vos intérêts',
    image: require('@/assets/images/Votes 3.png'),
  },
  {
    id: '4',
     title: [
      { text: 'Vivez les ', bold: true },
      { text: 'événements', bold: false }
    ],
    description: 'Recherchez des événements par catégorie, date ou lieu',
    image: require('@/assets/images/scene.png'),
  },
];