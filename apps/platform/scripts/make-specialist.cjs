const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const email = process.argv[2];
  if (!email) {
    console.error("Por favor, provee un email. Ejemplo: node make-specialist.cjs tu@email.com");
    process.exit(1);
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      console.error(`No se encontró un usuario con el email: ${email}`);
      process.exit(1);
    }

    const existingProfile = await prisma.specialistProfile.findUnique({
      where: { userId: user.id }
    });

    if (existingProfile) {
      console.log(`El usuario ${email} YA es un especialista verificado.`);
    } else {
      await prisma.specialistProfile.create({
        data: {
          userId: user.id,
          specialty: 'Psicología Clínica',
          title: 'Lic. en Psicología',
          bio: 'Especialista verificado de prueba para desarrollo.',
          clinicName: 'Centro Luminus',
        }
      });
      console.log(`¡Éxito! El usuario ${email} ahora es un Especialista Verificado.`);
    }
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
