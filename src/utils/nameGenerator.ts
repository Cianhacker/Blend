import { Gender, Role } from '../types/game';

const FIRST_NAMES_MALE = [
  'Liam', 'Noah', 'Ethan', 'Oliver', 'Lucas', 'Mason', 'Logan', 'Aiden',
  'Leo', 'Jayden', 'Caleb', 'Ryan', 'Ezra', 'Jax', 'Wyatt', 'Carter',
  'Arthur', 'Sterling', 'Winston', 'Barnaby', 'Silas', 'Derrick', 'Dexter'
];

const FIRST_NAMES_FEMALE = [
  'Emma', 'Olivia', 'Ava', 'Sophia', 'Isabella', 'Mia', 'Charlotte', 'Harper',
  'Luna', 'Chloe', 'Zoe', 'Penelope', 'Nora', 'Riley', 'Stella', 'Maya',
  'Eleanor', 'Vivian', 'Beatrice', 'Clementine', 'Joyner', 'Rosalind'
];

const FIRST_NAMES_NEUTRAL = [
  'Alex', 'Jordan', 'Taylor', 'Morgan', 'Casey', 'Sam', 'Riley', 'Rowan',
  'Quinn', 'Avery', 'Kai', 'Skyler', 'Finley', 'Reese', 'Dakota', 'Hayden'
];

const LAST_NAMES = [
  'Sterling', 'Vance', 'Holloway', 'Blackwood', 'Chen', 'Rodriguez', 'Kingsley',
  'Patel', 'Sinclair', 'Fairchild', 'Grimshaw', 'Thornton', 'Mercer', 'Gallagher',
  'Frost', 'Winters', 'Hawthorne', 'Montgomery', 'Kovacs', 'Castillo', 'O\'Connor'
];

const NICKNAMES_BULLY = [
  'The Bruiser', 'Knuckles', 'Crusher', 'Spike', 'Razor', 'Hammer', 'Brawler'
];

const NICKNAMES_STUDENT = [
  'Ace', 'Brainiac', 'Flash', 'Giggles', 'Chill', 'Echo', 'Speedy', 'Comet'
];

export function generateRandomName(role: Role | string, gender: Gender): string {
  let firstList = FIRST_NAMES_NEUTRAL;
  if (gender === 'male') {
    firstList = [...FIRST_NAMES_MALE, ...FIRST_NAMES_NEUTRAL];
  } else if (gender === 'female') {
    firstList = [...FIRST_NAMES_FEMALE, ...FIRST_NAMES_NEUTRAL];
  }

  const first = firstList[Math.floor(Math.random() * firstList.length)];
  const last = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];

  if (role === 'teacher') {
    const title = gender === 'female' ? 'Ms.' : gender === 'male' ? 'Mr.' : 'Prof.';
    return `${title} ${first} ${last}`;
  }

  if (role === 'principal') {
    return `Principal ${first} ${last}`;
  }

  if (role === 'janitor') {
    return `Caretaker ${first} ${last}`;
  }

  if (role === 'nurse') {
    return `Nurse ${first} ${last}`;
  }

  if (role === 'cook') {
    return `Chef ${first} ${last}`;
  }

  if (role === 'bully') {
    const nick = NICKNAMES_BULLY[Math.floor(Math.random() * NICKNAMES_BULLY.length)];
    return `${first} '${nick}' ${last}`;
  }

  if (role === 'athlete') {
    return `${first} 'Speed' ${last}`;
  }

  return `${first} ${last}`;
}
