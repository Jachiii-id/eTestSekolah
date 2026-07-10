import type { Question } from '@/types';

// Parsed from English_Placement_Test_SMP_TEACHER.md — verified against the
// answer-key summary table (Part 1/2/3), zero mismatches.

const SCHOOL_EVENTS_PASSAGE =
  "Every year, SDN Mekar Jaya holds special events for its students. The school year begins in July and ends in June. In August, the school celebrates Independence Day with a flag ceremony and fun games.\n\n" +
  "In September, the school holds a Science Fair where students display their projects. The students' favorite event, however, is Sports Day, which is always held on the third Saturday of October. This year, Sports Day falls on October 17th.\n\n" +
  "Fajar's birthday is on May 5th, and he always invites his friends to a small party at home. His best friend, Nadia, was born in January, the first month of the year.";

const DITO_PASSAGE =
  "Last Sunday, October 4th, Dito went to the traditional market with his mother. They bought a loaf of bread, a bottle of milk, and a bar of chocolate for the family. At a food stall, Dito ordered a bowl of bakso for 5,000 rupiahs. The bakso tasted a little salty, but it was delicious.\n\n" +
  "Before they went home, Dito's mother bought a new pair of trousers and a blue tie for his school uniform, because his old uniform was too small. On the way home, Dito said his stomach felt strange. That night, he had a stomachache and could not eat dinner. His mother gave him warm tea and let him rest.";

export const QUESTIONS: Question[] = [
  {
    number: 1,
    part: 1,
    section: "A",
    text: "Lemon and vinegar taste ______.",
    options: {
      A: "sweet",
      B: "bitter",
      C: "sour",
      D: "salty"
    },
    correctAnswer: "C"
  },
  {
    number: 2,
    part: 1,
    section: "A",
    text: "This soup has too much salt. It tastes very ______.",
    options: {
      A: "sweet",
      B: "salty",
      C: "sour",
      D: "bitter"
    },
    correctAnswer: "B"
  },
  {
    number: 3,
    part: 1,
    section: "A",
    text: "Sugar and honey make food taste ______.",
    options: {
      A: "sour",
      B: "bitter",
      C: "sweet",
      D: "salty"
    },
    correctAnswer: "C"
  },
  {
    number: 4,
    part: 1,
    section: "A",
    text: "I want ______ of water, please.",
    options: {
      A: "a bar",
      B: "a loaf",
      C: "a bottle",
      D: "a hand"
    },
    correctAnswer: "C"
  },
  {
    number: 5,
    part: 1,
    section: "A",
    text: "My mother bought ______ of bread at the bakery.",
    options: {
      A: "a bottle",
      B: "a loaf",
      C: "a bar",
      D: "a hand"
    },
    correctAnswer: "B"
  },
  {
    number: 6,
    part: 1,
    section: "A",
    text: "He ate ______ of chocolate after lunch.",
    options: {
      A: "a loaf",
      B: "a bottle",
      C: "a bar",
      D: "a hand"
    },
    correctAnswer: "C"
  },
  {
    number: 7,
    part: 1,
    section: "A",
    text: "There is ______ of bananas on the table.",
    options: {
      A: "a bottle",
      B: "a hand",
      C: "a loaf",
      D: "a bar"
    },
    correctAnswer: "B"
  },
  {
    number: 8,
    part: 1,
    section: "A",
    text: "A kilo of sugar costs 11,000 rupiahs. How do we say \"11,000\" in English?",
    options: {
      A: "one hundred eleven",
      B: "eleven hundred",
      C: "eleven thousand",
      D: "one thousand eleven"
    },
    correctAnswer: "C"
  },
  {
    number: 9,
    part: 1,
    section: "A",
    text: "A bowl of bakso is 5,000 rupiahs. How much is it?",
    options: {
      A: "It is five hundred rupiahs",
      B: "It is five thousand rupiahs",
      C: "It is fifty thousand rupiahs",
      D: "It is fifteen rupiahs"
    },
    correctAnswer: "B"
  },
  {
    number: 10,
    part: 1,
    section: "A",
    text: "______ is a glass of orange juice? — It is two thousand rupiahs.",
    options: {
      A: "How many",
      B: "What",
      C: "How much",
      D: "How old"
    },
    correctAnswer: "C"
  },
  {
    number: 11,
    part: 1,
    section: "A",
    text: "My stomach hurts. I have a ______.",
    options: {
      A: "headache",
      B: "stomachache",
      C: "toothache",
      D: "sore throat"
    },
    correctAnswer: "B"
  },
  {
    number: 12,
    part: 1,
    section: "A",
    text: "My tooth hurts a lot. I have a ______.",
    options: {
      A: "cold",
      B: "sore eyes",
      C: "toothache",
      D: "headache"
    },
    correctAnswer: "C"
  },
  {
    number: 13,
    part: 1,
    section: "A",
    text: "Rani's eyes are red and hurt. She has ______.",
    options: {
      A: "a cold",
      B: "sore eyes",
      C: "a headache",
      D: "a toothache"
    },
    correctAnswer: "B"
  },
  {
    number: 14,
    part: 1,
    section: "A",
    text: "Bayu sneezes a lot and has a runny nose. He has a ______.",
    options: {
      A: "cold",
      B: "toothache",
      C: "headache",
      D: "sore throat"
    },
    correctAnswer: "A"
  },
  {
    number: 15,
    part: 1,
    section: "A",
    text: "She wears a ______ around her neck with her school uniform.",
    options: {
      A: "hat",
      B: "tie",
      C: "socks",
      D: "blouse"
    },
    correctAnswer: "B"
  },
  {
    number: 16,
    part: 1,
    section: "A",
    text: "He is wearing ______ on his feet.",
    options: {
      A: "a hat",
      B: "shoes",
      C: "a blouse",
      D: "a tie"
    },
    correctAnswer: "B"
  },
  {
    number: 17,
    part: 1,
    section: "A",
    text: "In cold weather, people often wear a ______ on their head.",
    options: {
      A: "hat",
      B: "socks",
      C: "tie",
      D: "shoes"
    },
    correctAnswer: "A"
  },
  {
    number: 18,
    part: 1,
    section: "A",
    text: "My father wears his ______ to work every day.",
    options: {
      A: "long dress",
      B: "uniform",
      C: "skirt",
      D: "shorts"
    },
    correctAnswer: "B"
  },
  {
    number: 19,
    part: 1,
    section: "A",
    text: "We use our ______ to smell flowers.",
    options: {
      A: "eyes",
      B: "ears",
      C: "nose",
      D: "hair"
    },
    correctAnswer: "C"
  },
  {
    number: 20,
    part: 1,
    section: "A",
    text: "Aisyah uses her headset to listen to music with her ______.",
    options: {
      A: "eyes",
      B: "ears",
      C: "nose",
      D: "chin"
    },
    correctAnswer: "B"
  },
  {
    number: 21,
    part: 2,
    section: "A",
    text: "The giraffe is tall, but the deer is ______.",
    options: {
      A: "tall",
      B: "short",
      C: "big",
      D: "small"
    },
    correctAnswer: "B"
  },
  {
    number: 22,
    part: 2,
    section: "A",
    text: "This is a new car. The opposite of \"new\" is ______.",
    options: {
      A: "old",
      B: "young",
      C: "fast",
      D: "slow"
    },
    correctAnswer: "A"
  },
  {
    number: 23,
    part: 2,
    section: "A",
    text: "This bag is very expensive. The opposite of \"expensive\" is ______.",
    options: {
      A: "cheap",
      B: "big",
      C: "small",
      D: "fast"
    },
    correctAnswer: "A"
  },
  {
    number: 24,
    part: 2,
    section: "A",
    text: "Is the rabbit smaller than the goat?",
    options: {
      A: "Yes, it is",
      B: "No, it is not",
      C: "Yes, it does",
      D: "No, it isn't small"
    },
    correctAnswer: "A"
  },
  {
    number: 25,
    part: 2,
    section: "A",
    text: "The goat is bigger than the rabbit. Which animal is smaller?",
    options: {
      A: "The goat",
      B: "The rabbit",
      C: "Both are the same size",
      D: "Not mentioned"
    },
    correctAnswer: "B"
  },
  {
    number: 26,
    part: 2,
    section: "A",
    text: "The cheetah runs ______ than the turtle. (fast)",
    options: {
      A: "fast",
      B: "faster",
      C: "fastest",
      D: "more fast"
    },
    correctAnswer: "B"
  },
  {
    number: 27,
    part: 2,
    section: "A",
    text: "This book is ______ than that book. (old)",
    options: {
      A: "old",
      B: "older",
      C: "oldest",
      D: "more old"
    },
    correctAnswer: "B"
  },
  {
    number: 28,
    part: 2,
    section: "A",
    text: "The elephant is the ______ animal in the zoo. (big)",
    options: {
      A: "big",
      B: "bigger",
      C: "biggest",
      D: "more big"
    },
    correctAnswer: "C"
  },
  {
    number: 29,
    part: 2,
    section: "A",
    text: "Which is the tallest? The giraffe is the ______.",
    options: {
      A: "tall",
      B: "taller",
      C: "tallest",
      D: "more tall"
    },
    correctAnswer: "C"
  },
  {
    number: 30,
    part: 2,
    section: "A",
    text: "How is the cat compared to the giraffe? The cat is ______ than the giraffe.",
    options: {
      A: "small",
      B: "smaller",
      C: "smallest",
      D: "more small"
    },
    correctAnswer: "B"
  },
  {
    number: 31,
    part: 3,
    section: "A",
    text: "When does the school year begin?",
    options: {
      A: "In June",
      B: "In July",
      C: "In August",
      D: "In September"
    },
    correctAnswer: "B",
    passage: SCHOOL_EVENTS_PASSAGE
  },
  {
    number: 32,
    part: 3,
    section: "A",
    text: "In which month does the school celebrate Independence Day?",
    options: {
      A: "July",
      B: "August",
      C: "September",
      D: "October"
    },
    correctAnswer: "B",
    passage: SCHOOL_EVENTS_PASSAGE
  },
  {
    number: 33,
    part: 3,
    section: "A",
    text: "What date is Sports Day this year?",
    options: {
      A: "October 7th",
      B: "October 17th",
      C: "October 27th",
      D: "October 3rd"
    },
    correctAnswer: "B",
    passage: SCHOOL_EVENTS_PASSAGE
  },
  {
    number: 34,
    part: 3,
    section: "A",
    text: "In which month is the Science Fair held?",
    options: {
      A: "July",
      B: "August",
      C: "September",
      D: "November"
    },
    correctAnswer: "C",
    passage: SCHOOL_EVENTS_PASSAGE
  },
  {
    number: 35,
    part: 3,
    section: "A",
    text: "Based on the passage, when is Fajar's birthday?",
    options: {
      A: "January 5th",
      B: "May 5th",
      C: "May 15th",
      D: "October 5th"
    },
    correctAnswer: "B",
    passage: SCHOOL_EVENTS_PASSAGE
  },
  {
    number: 36,
    part: 3,
    section: "B",
    text: "When did Dito go to the market?",
    options: {
      A: "September 4th",
      B: "October 4th",
      C: "October 14th",
      D: "November 4th"
    },
    correctAnswer: "B",
    passage: DITO_PASSAGE
  },
  {
    number: 37,
    part: 3,
    section: "B",
    text: "How much did the bowl of bakso cost?",
    options: {
      A: "500 rupiahs",
      B: "5,000 rupiahs",
      C: "15,000 rupiahs",
      D: "50,000 rupiahs"
    },
    correctAnswer: "B",
    passage: DITO_PASSAGE
  },
  {
    number: 38,
    part: 3,
    section: "B",
    text: "What did the bakso taste like?",
    options: {
      A: "Sweet",
      B: "Sour",
      C: "Salty",
      D: "Bitter"
    },
    correctAnswer: "C",
    passage: DITO_PASSAGE
  },
  {
    number: 39,
    part: 3,
    section: "B",
    text: "Why did Dito's mother buy him a new uniform?",
    options: {
      A: "He lost his old one",
      B: "His old uniform was too small",
      C: "It was his birthday",
      D: "The school asked for a new color"
    },
    correctAnswer: "B",
    passage: DITO_PASSAGE
  },
  {
    number: 40,
    part: 3,
    section: "B",
    text: "What happened to Dito that night?",
    options: {
      A: "He went to a party",
      B: "He had a headache",
      C: "He had a stomachache",
      D: "He bought new shoes"
    },
    correctAnswer: "C",
    passage: DITO_PASSAGE
  }
];
