"use client";

import { useState, useEffect } from 'react';
import { db } from '@/app/firebase/firebaseConfig';
import { collection, query, where, getDocs, deleteDoc } from "firebase/firestore";

export default function Form() {
  const [todayReservation, setTodayReservation] = useState<any>(null);

  useEffect(() => {
    const reservas = JSON.parse(localStorage.getItem('reservas') || '[]');
    const todayDate = new Date().toISOString().split('T')[0];
    const todayReserva = reservas.find((reserva: any) => reserva.date === todayDate);

    setTodayReservation(todayReserva);
  }, []);

  const handleRemoveReservation = async () => {
    if (todayReservation) {
      try {
        // Consulta ao Firestore para encontrar a reserva correspondente
        const q = query(
          collection(db, "reservas"),
          where("date", "==", todayReservation.date),
          where("time", "==", todayReservation.time),
          where("name", "==", todayReservation.name)
        );
        const snapshot = await getDocs(q);
  
        // Remove o documento correspondente do Firestore
        snapshot.forEach(async (doc) => {
          await deleteDoc(doc.ref);
        });

        // Atualiza o localStorage removendo a reserva do dia
        const reservas = JSON.parse(localStorage.getItem('reservas') || '[]');
        const updatedReservas = reservas.filter(
          (reserva: any) =>
            reserva.date !== todayReservation.date ||
            reserva.time !== todayReservation.time
        );
  
        // Atualiza o localStorage
        localStorage.setItem('reservas', JSON.stringify(updatedReservas));
  
        // Exibe alerta e atualiza o estado para null
        alert("Reserva removida com sucesso!");
        setTodayReservation(null);
      } catch (error) {
        console.error("Erro ao remover a reserva: ", error);
        alert("Erro ao remover a reserva.");
      }
    }
  };

  return (
    <div>
      {todayReservation && (
        <div className="bg-white shadow-lg rounded-lg p-4 mb-6 w-full max-w-md text-black">
          <h2 className="text-xl font-semibold mb-4">Reserva de hoje</h2>
          <p>Nome: {todayReservation.name}</p>
          <p>Serviço: {todayReservation.service}</p>
          <p>Horário: {todayReservation.time}</p>
          <button
            className="mt-4 w-full bg-red-500 text-white p-2 rounded-lg hover:bg-red-600 transition-colors"
            onClick={handleRemoveReservation}
          >
            Remover Reserva
          </button>
        </div>
      )}
    </div>
  );
}
