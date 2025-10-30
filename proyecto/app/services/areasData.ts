/**
 * Definición de áreas y sus horarios
 */

export type Area = {
  id: string;
  title: string;
  subtitle: string;
  image: any;
};

export const AREAS: Area[] = [
  {
    id: '1',
    title: 'Secretaría Académica',
    subtitle: 'Abierto de 2:00 pm a 3:00 pm',
    image: require('@/assets/images/partial-react-logo.png'),
  },
  {
    id: '2',
    title: 'Secretaría Administrativa',
    subtitle: 'Abierto de 8:00 am a 2:30 pm',
    image: require('@/assets/images/react-logo.png'),
  },
  {
    id: '3',
    title: 'Biblioteca',
    subtitle: 'Abierto de 9:00 am a 5:00 pm',
    image: require('@/assets/images/partial-react-logo.png'),
  },
  {
    id: '4',
    title: 'Oficina de Admisiones',
    subtitle: 'Abierto de 10:00 am a 4:00 pm',
    image: require('@/assets/images/react-logo.png'),
  },
];
