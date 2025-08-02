// prisma/seed.ts
import {
  PrismaClient,
  PetStat,
  ItemType,
  HabitType,
  Difficulty,
  RepeatFrequency,
  EquipmentSlot,
} from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Starting the seeding process...');

  // --- 1. Seed Core Game Data (Items, Public Challenges) ---
  console.log('🌱 Seeding Pet Items...');
  await seedPetItems();

  console.log('🌱 Seeding Public Challenges...');
  const challenges = await seedChallenges();

  // --- 2. Seed Users and their associated data ---
  console.log('👤 Seeding user: Alice');
  const alice = await seedUser('alice@example.com', 'alice', 'Password123!', {
    habits: [
      {
        title: 'Exercise for 30 minutes',
        type: HabitType.POSITIVE,
        difficulty: Difficulty.MEDIUM,
      },
      {
        title: 'Read a book chapter',
        type: HabitType.POSITIVE,
        difficulty: Difficulty.EASY,
      },
      {
        title: 'Avoid junk food',
        type: HabitType.NEGATIVE,
        difficulty: Difficulty.HARD,
      },
    ],
    dailies: [
      { title: 'Morning Meditation', difficulty: Difficulty.EASY },
      { title: 'Check emails', difficulty: Difficulty.TRIVIAL },
    ],
    todos: [
      { title: 'Buy groceries' },
      { title: 'Finish NestJS project report', difficulty: Difficulty.HARD },
    ],
    rewards: [
      { title: 'Watch a movie', cost: 50 },
      { title: 'Order takeout', cost: 150 },
    ],
  });

  console.log('👤 Seeding user: Bob');
  const bob = await seedUser('bob@example.com', 'bob', 'Password123!', {
    habits: [
      {
        title: 'Drink 8 glasses of water',
        type: HabitType.POSITIVE,
        difficulty: Difficulty.EASY,
      },
    ],
    dailies: [{ title: 'Walk the dog', difficulty: Difficulty.MEDIUM }],
  });

  // --- 3. Seed Social Interactions ---
  console.log('🤝 Seeding Groups and Memberships...');
  const group = await seedGroup(
    'The Procrastinators',
    'A group for getting things done... eventually.',
    alice.id,
  );
  await joinGroup(group.id, bob.id);

  console.log('🏆 Seeding Challenge Participations...');
  await joinChallenge(challenges[0].id, alice.id); // Alice joins "30-Day Fitness Challenge"
  await joinChallenge(challenges[1].id, bob.id); // Bob joins "Mindful Mornings"

  console.log('✅ Seeding finished successfully!');
}

// --- Seeder Functions ---

async function seedPetItems() {
  const items = [
    // Consumables
    {
      name: 'Apple',
      description: 'A crunchy, healthy fruit.',
      type: ItemType.FOOD,
      cost: 5,
      statEffect: PetStat.HUNGER,
      effectValue: 10,
    },
    {
      name: 'Steak',
      description: 'A hearty meal for a hungry pet.',
      type: ItemType.FOOD,
      cost: 15,
      statEffect: PetStat.HUNGER,
      effectValue: 30,
    },
    {
      name: 'Candy',
      description: 'A sugary treat that boosts happiness.',
      type: ItemType.TREAT,
      cost: 10,
      statEffect: PetStat.HAPPINESS,
      effectValue: 20,
    },
    // Customization
    {
      name: 'Top Hat',
      description: 'A very fancy top hat.',
      type: ItemType.CUSTOMIZATION,
      cost: 100,
      equipmentSlot: EquipmentSlot.HAT,
    },
    {
      name: 'Sunglasses',
      description: 'Cool shades for a cool pet.',
      type: ItemType.CUSTOMIZATION,
      cost: 75,
      equipmentSlot: EquipmentSlot.GLASSES,
    },
  ];

  for (const item of items) {
    await prisma.petItem.upsert({
      where: { name: item.name },
      update: {},
      create: item,
    });
  }
}

async function seedChallenges() {
  const challengesData = [
    {
      title: '30-Day Fitness Challenge',
      description: 'Work out every day for 30 days.',
      goal: 'Log 30 fitness activities.',
    },
    {
      title: 'Mindful Mornings',
      description: 'Start your day with meditation.',
      goal: 'Meditate for 15 days this month.',
    },
    {
      title: 'Bookworm Challenge',
      description: 'Read more books this quarter.',
      goal: 'Finish 5 books.',
    },
  ];

  const createdOrFoundChallenges = [];
  for (const data of challengesData) {
    let challenge = await prisma.challenge.findFirst({
      where: { title: data.title },
    });

    if (!challenge) {
      challenge = await prisma.challenge.create({ data });
    }
    createdOrFoundChallenges.push(challenge);
  }
  return createdOrFoundChallenges;
}

async function seedUser(
  email: string,
  username: string,
  password,
  data: Record<string, any[]>,
) {
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      username,
      passwordHash: hashedPassword,
      gold: 100,
      gems: 10,
      pet: {
        create: {
          name: `${username}'s Pet`,
          // CORRECTED: 'species' property removed to match schema
        },
      },
      habits: { create: data.habits },
      dailies: { create: data.dailies },
      todos: { create: data.todos },
      rewards: { create: data.rewards },
    },
  });
  return user;
}

async function seedGroup(name: string, description: string, adminId: string) {
  const group = await prisma.group.upsert({
    where: { name },
    update: {},
    create: { name, description, isPublic: true },
  });

  await prisma.userGroup.upsert({
    where: { userId_groupId: { userId: adminId, groupId: group.id } },
    update: {},
    create: { userId: adminId, groupId: group.id, role: 'ADMIN' },
  });
  return group;
}

async function joinGroup(groupId: string, userId: string) {
  await prisma.userGroup.upsert({
    where: { userId_groupId: { userId, groupId } },
    update: {},
    create: { userId, groupId, role: 'MEMBER' },
  });
}

async function joinChallenge(challengeId: string, userId: string) {
  await prisma.userChallenge.upsert({
    where: { userId_challengeId: { userId, challengeId } },
    update: {},
    create: { userId, challengeId },
  });
}

// --- Main Execution ---
main()
  .catch((e) => {
    console.error('An error occurred during seeding:');
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
