generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

model User {
  id           String   @id @default(uuid())
  name         String
  phone        String   @unique
  email        String   @unique
  passwordHash String
  role         Role
  verified     Boolean  @default(false)
  createdAt    DateTime @default(now())

  company      Company?
  vehicles     Vehicle[]
  trips        Trip[]   @relation("DriverTrips")
  bookings     Booking[]
  ratings      Rating[]
  messagesSent Message[] @relation("Sender")
  messagesRecv Message[] @relation("Receiver")
  notifications Notification[]
}

model Company {
  id               String   @id @default(uuid())
  userId           String   @unique
  companyName      String
  registrationNum  String
  businessPhone    String

  user             User     @relation(fields: [userId], references: [id])
  vehicles         Vehicle[]
  trips            Trip[]   @relation("CompanyTrips")
}

model Vehicle {
  id          String   @id @default(uuid())
  ownerId     String
  type        VehicleType
  model       String
  plateNumber String

  owner       User     @relation(fields: [ownerId], references: [id])
  trips       Trip[]
}

model Trip {
  id             String   @id @default(uuid())
  driverId       String
  vehicleId      String
  departureCity  String
  arrivalCity    String
  departureTime  DateTime
  arrivalTime    DateTime
  seatCount      Int
  pricePerSeat   Decimal
  isRecurring    Boolean  @default(false)
  recurrenceType RecurrenceType

  driver         User     @relation("DriverTrips", fields: [driverId], references: [id])
  vehicle        Vehicle  @relation(fields: [vehicleId], references: [id])
  bookings       Booking[]
  ratings        Rating[]
  messages       Message[]
}

model Booking {
  id           String   @id @default(uuid())
  tripId       String
  passengerId  String
  seatCount    Int
  status       BookingStatus
  createdAt    DateTime @default(now())

  trip         Trip     @relation(fields: [tripId], references: [id])
  passenger    User     @relation(fields: [passengerId], references: [id])
}

model Rating {
  id           String   @id @default(uuid())
  tripId       String
  passengerId  String
  ratingValue  Int
  comment      String?
  createdAt    DateTime @default(now())

  trip         Trip     @relation(fields: [tripId], references: [id])
  passenger    User     @relation(fields: [passengerId], references: [id])
}

model Message {
  id         String   @id @default(uuid())
  senderId   String
  receiverId String
  tripId     String
  content    String
  sentAt     DateTime @default(now())

  sender     User     @relation("Sender", fields: [senderId], references: [id])
  receiver   User     @relation("Receiver", fields: [receiverId], references: [id])
  trip       Trip     @relation(fields: [tripId], references: [id])
}

model Notification {
  id        String   @id @default(uuid())
  userId    String
  type      NotificationType
  message   String
  isRead    Boolean  @default(false)
  createdAt DateTime @default(now())

  user      User     @relation(fields: [userId], references: [id])
}

enum Role {
  PASSENGER
  DRIVER
  COMPANY
  ADMIN
}

enum VehicleType {
  CAR
  MINIBUS
  BUS
}

enum RecurrenceType {
  NONE
  DAILY
  WEEKLY
}

enum BookingStatus {
  PENDING
  CONFIRMED
  CANCELLED
}

enum NotificationType {
  BOOKING_CONFIRMED
  TRIP_REMINDER
  CANCELLATION
  GENERAL
}
