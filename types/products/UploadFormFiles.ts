export interface UploadFormFiles {
  Id: string;
  FileByte: string; // ใช้ string สำหรับ base64
  Categorie: string;
  FileName: string;
  FileSize: number;
  MimeType: string;
}
