export interface Booking {
  Status?: string | undefined;
  BooikingId: string;
  SpaceId: string;
  CreateDate: Date;
  BooikingNo?: string;
  RoomName?: string;
  MeetingDateStart: Date;
  MeetingDateEnd: Date;
  MeetingName?: string;
}
