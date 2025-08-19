import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Create demo users
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@demo.com' },
    update: {},
    create: {
      email: 'admin@demo.com',
      name: 'Admin User',
      role: 'ADMIN',
    },
  })

  const regularUser = await prisma.user.upsert({
    where: { email: 'user@demo.com' },
    update: {},
    create: {
      email: 'user@demo.com',
      name: 'Regular User',
      role: 'USER',
    },
  })

  // Create demo recipes
  const recipe1 = await prisma.recipe.create({
    data: {
      title: 'Classic Spaghetti Carbonara',
      ingredients: JSON.stringify([
        '400g spaghetti',
        '200g pancetta or guanciale',
        '4 large eggs',
        '100g Pecorino Romano cheese',
        'Black pepper',
        'Salt'
      ]),
      steps: JSON.stringify([
        'Bring a large pot of salted water to boil',
        'Cook spaghetti according to package directions',
        'While pasta cooks, fry pancetta until crispy',
        'Beat eggs with grated cheese and black pepper',
        'Drain pasta, reserving 1 cup pasta water',
        'Mix hot pasta with pancetta and fat',
        'Remove from heat and quickly stir in egg mixture',
        'Add pasta water if needed for creamy consistency',
        'Serve immediately with extra cheese and pepper'
      ]),
      prepTime: 30,
      servingSize: 4,
      status: 'PUBLISHED',
      publishedAt: new Date(),
      authorId: adminUser.id,
    },
  })

  const recipe2 = await prisma.recipe.create({
    data: {
      title: 'Chocolate Chip Cookies',
      ingredients: JSON.stringify([
        '2¼ cups all-purpose flour',
        '1 tsp baking soda',
        '1 tsp salt',
        '1 cup butter, softened',
        '¾ cup granulated sugar',
        '¾ cup brown sugar',
        '2 large eggs',
        '2 tsp vanilla extract',
        '2 cups chocolate chips'
      ]),
      steps: JSON.stringify([
        'Preheat oven to 375°F (190°C)',
        'Mix flour, baking soda, and salt in a bowl',
        'Cream butter and sugars until light and fluffy',
        'Beat in eggs one at a time, then vanilla',
        'Gradually blend in flour mixture',
        'Stir in chocolate chips',
        'Drop rounded tablespoons onto ungreased baking sheets',
        'Bake for 9-11 minutes until golden brown',
        'Cool on baking sheet for 2 minutes, then transfer'
      ]),
      prepTime: 25,
      servingSize: 24,
      status: 'PUBLISHED',
      publishedAt: new Date(),
      authorId: regularUser.id,
    },
  })

  console.log('Seed data created successfully!')
  console.log('Admin user:', adminUser)
  console.log('Regular user:', regularUser)
  console.log('Recipes created:', { recipe1, recipe2 })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })