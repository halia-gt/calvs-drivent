import { prisma } from "@/config";

async function findBooking(userId: number) {
  return prisma.booking.findFirst({
    select: {
      id: true,
      Room: true,
    },
    where: {
      userId,
    },
  });
}

const bookingRepository = {
  findBooking,
};

export default bookingRepository;
