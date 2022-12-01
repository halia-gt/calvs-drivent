import enrollmentRepository from "@/repositories/enrollment-repository";
import ticketRepository from "@/repositories/ticket-repository";
import { notFoundError } from "@/errors";
import bookingRepository from "@/repositories/booking-repository";
import hotelRepository from "@/repositories/hotel-repository";
import { forbiddenError } from "@/errors/forbidden-error";

async function checkBooking(userId: number) {
  const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);
  if (!enrollment) {
    throw notFoundError();
  }

  const ticket = await ticketRepository.findTicketByEnrollmentId(enrollment.id);

  if (!ticket || ticket.status === "RESERVED" || ticket.TicketType.isRemote || !ticket.TicketType.includesHotel) {
    throw notFoundError();
  }
}

async function getBooking(userId: number) {
  await checkBooking(userId);

  const result = await bookingRepository.findBookingByUserId(userId);
  if (!result) {
    throw notFoundError();
  }

  return result;
}

async function postBooking(userId: number, roomId: number) {
  await checkBooking(userId);

  const room = await hotelRepository.findRoomsByRoomId(roomId);
  if (!room) {
    throw notFoundError();
  }

  const userBooking = await bookingRepository.findBookingByUserId(userId);
  if (userBooking) {
    console.log(userBooking);
    throw forbiddenError();
  }

  const bookings = await bookingRepository.findBookingsByRoomId(roomId);
  if (bookings.length === room.capacity) {
    console.log("flag 2");
    throw forbiddenError();
  }

  const result = await bookingRepository.createBooking(userId, roomId);

  return result;
}

const bookingService = {
  getBooking,
  postBooking,
};

export default bookingService;
