import { Response } from "express";
import { AuthenticatedRequest } from "@/middlewares";
import httpStatus from "http-status";
import bookingService from "@/services/booking-service";
import { forbiddenError } from "@/errors";

function verifyParameters(param: number): boolean {
  if (!param || isNaN(param) || param <= 0) {
    return true;
  }

  return false;
}

export async function getBooking(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;

  try {
    const booking = await bookingService.getBooking(Number(userId));
    return res.status(httpStatus.OK).send(booking);
  } catch (error) {
    return res.sendStatus(httpStatus.NOT_FOUND);
  }
}

export async function postBooking(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;
  const { roomId: stringId } = req.body;
  const roomId = Number(stringId);

  try {
    if (verifyParameters(roomId)) {
      throw forbiddenError();
    }

    const booking = await bookingService.postBooking(Number(userId), roomId);
    return res.status(httpStatus.OK).send({ bookingId: booking.id });
  } catch (error) {
    if (error.name === "NotFoundError") {
      return res.sendStatus(httpStatus.NOT_FOUND);
    }

    return res.sendStatus(httpStatus.FORBIDDEN);
  }
}

export async function updateBooking(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;
  const { roomId: stringRoomId } = req.body;
  const { bookingId: stringBookingId } = req.params;
  const roomId = Number(stringRoomId);
  const bookingId = Number(stringBookingId);

  try {
    if (verifyParameters(roomId) || verifyParameters(bookingId)) {
      throw forbiddenError();
    }

    const booking = await bookingService.updateBooking(Number(userId), Number(bookingId), Number(roomId));
    return res.status(httpStatus.OK).send({ bookingId: booking.id });
  } catch (error) {
    if (error.name === "NotFoundError") {
      return res.sendStatus(httpStatus.NOT_FOUND);
    }

    return res.sendStatus(httpStatus.FORBIDDEN);
  }
}
