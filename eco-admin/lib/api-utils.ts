import { NextResponse } from "next/server";

export const validationFieldsApiStatus400 = (field: any, fieldName: string) => {
  if (!field)
    return new NextResponse(`${fieldName} is required`, { status: 400 });
};
