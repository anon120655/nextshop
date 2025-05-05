//prevState คือค่า state ล่าสุดก่อน action ทำงาน สามารถใช้เพื่ออ้างอิงค่าก่อนหน้า เช่น ผลลัพธ์เก่า หรือสถานะก่อน submit
//formData คือ FormData ที่ถูกส่งมาจาก <form> (อัตโนมัติเมื่อผู้ใช้กด submit)
//return ผลลัพธ์ใหม่ที่เป็น Promise ผลลัพธ์ที่ return → กลายเป็น state ใหม่โดยอัตโนมัติ
export type actionFunctions = (
  prevState: any,
  formData: FormData
) => Promise<{ message: string }>;
