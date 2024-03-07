import { PrismaClient } from '@prisma/client';
//import argon2 from 'argon2';

const prisma = new PrismaClient();
async function main() {
    //  await prisma.user.upsert({
    //    where: {
    //      email: 'admin@42.fr',
    //    },
    //    create: {
    //      name: 'Admin',
    //      email: 'admin@42.fr',
    //      password: argon2.hashSync('admin'),
    //    },
    //  });
}
main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
