"use client";

import { actionFunctions } from "@/utils/generalutils";
import { useActionState } from "react";
import { useEffect } from "react";
import { toast } from "sonner";

const initialState = {
  message: "",
};

const FormContainer = ({
  action,
  children,
}: {
  action: actionFunctions;
  children: React.ReactNode;
}) => {
  //state คือตัวที่ return มาจาก function
  //จะรู้ได้อย่างไรว่า state มีการเปลี่ยนค่าแล้ว ต้องใช้ useEffect
  //useActionState แวะเก็บข้อมูล action ใน useActionState ก่อนส่งไปที่ form

  const [state, formAction] = useActionState(action, initialState);

  //ถ้าใส่ [] ว่าง ๆ → useEffect จะทำงาน ครั้งเดียว ตอน component แรก
  //ถ้าไม่ใส่ [] เลย → useEffect จะ รันทุกครั้ง ที่ component มีการ render → มันจะรันวนไม่หยุด (infinite loop)
  //ใส่ state ใน [] ถ้าค่าใน state มีการเปลี่ยนแปลง useEffect จะทำงาน
  useEffect(() => {
    //code body
    if (state.message) {
      const errorMessages = state.message.split(",");
      toast(
        <div>
          {errorMessages.map((msg, index) => (
            <div key={index}>{msg}</div>
          ))}
        </div>,
        {
          position: "top-center", // กำหนดตำแหน่งที่ด้านบนตรงกลาง
        }
      );
    }
  }, [state]);

  return <form action={formAction}>{children}</form>;
};
export default FormContainer;
