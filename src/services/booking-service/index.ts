import enrollmentRepository from "@/repositories/enrollment-repository";
import ticketRepository from "@/repositories/ticket-repository";
import { notFoundError } from "@/errors";
import bookingRepository from "@/repositories/booking-repository";
import hotelRepository from "@/repositories/hotel-repository";
import { forbiddenError } from "@/errors/forbidden-error";

async function checkEnrollmentAndTicket(userId: number) {
  const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);
  if (!enrollment) {
    throw notFoundError();
  }

  const ticket = await ticketRepository.findTicketByEnrollmentId(enrollment.id);

  if (!ticket || ticket.status === "RESERVED" || ticket.TicketType.isRemote || !ticket.TicketType.includesHotel) {
    throw notFoundError();
  }
}

async function checkBooking(roomId: number) {
  const room = await hotelRepository.findRoomsByRoomId(roomId);
  if (!room) {
    throw notFoundError();
  }

  const bookings = await bookingRepository.findBookingsByRoomId(roomId);
  if (bookings.length === room.capacity) {
    throw forbiddenError();
  }
}

async function getBooking(userId: number) {
  await checkEnrollmentAndTicket(userId);

  const result = await bookingRepository.findBookingByUserId(userId);
  if (!result) {
    throw notFoundError();
  }

  return result;
}

async function postBooking(userId: number, roomId: number) {
  await checkEnrollmentAndTicket(userId);
  await checkBooking(roomId);

  const userBooking = await bookingRepository.findBookingByUserId(userId);
  if (userBooking) {
    throw forbiddenError();
  }

  const result = await bookingRepository.createBooking(userId, roomId);

  return result;
}

async function updateBooking(userId: number, bookingId: number, roomId: number) {
  const booking = await bookingRepository.findBookingsById(bookingId);
  if (!booking) {
    throw notFoundError();
  }

  if (booking.userId !== userId) {
    throw forbiddenError();
  }

  await checkBooking(roomId);

  const result = await bookingRepository.updateBooking(bookingId, roomId);

  return result;
}

const bookingService = {
  getBooking,
  postBooking,
  updateBooking,
};

export default bookingService;
