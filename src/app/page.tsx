"use client";

import { useEffect, useState } from "react";
import Form from "@/app/pages/form";
import Reserve from "@/app/pages/reserve";

export default function Home() {
  const [hasReservations, setHasReservations] = useState(false);

  useEffect(() => {
    const reservas = JSON.parse(localStorage.getItem("reservas") || "[]");
    console.log('reservas',reservas)
    if (reservas.length > 0) {
      setHasReservations(true);
    }
  }, []);

  

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-6">
      {hasReservations ? (
        <Reserve />
      ) : (
        <Form />
      )}
    </div>
  );
}
