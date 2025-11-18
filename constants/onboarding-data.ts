import { ImageSourcePropType } from 'react-native';

export interface OnboardingSlide {
  id: string;
  title: string;
  description: string;
  image: ImageSourcePropType;
}

export const ONBOARDING_SLIDES: OnboardingSlide[] = [
  {
    id: '1',
    title: 'Bienvenue sur Difract',
    description: 'Découvrez et participez aux événements autour de vous',
    image: require('@/assets/images/LogoDifract.png'),
  },
  {
    id: '2',
    title: 'Votez pour vos événements',
    description: 'Exprimez votre opinion et influencez les événements à venir',
    image: require('@/assets/images/Votes 2.png'),
  },
  {
    id: '3',
    title: 'Explorez les événements',
    description: 'Trouvez des événements qui correspondent à vos intérêts',
    image: require('@/assets/images/Votes 3.png'),
  },
  {
    id: '4',
    title: 'Recherchez facilement',
    description: 'Recherchez des événements par catégorie, date ou lieu',
    image: require('@/assets/images/scene.png'),
  },
];