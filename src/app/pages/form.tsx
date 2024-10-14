"use client";

import { useState, useEffect } from 'react';
import { db } from '@/app/firebase/firebaseConfig';
import { collection, addDoc, query, where, getDocs, serverTimestamp } from "firebase/firestore";
import Reserve from './reserve';
import axios from 'axios';

export default function Form() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    date: '',
    service: '',
    time: '',
  });

  const sendWhatsAppMessage = async (phone: string, message: string) => {
    const url = `https://api.whatsapp.com/send?phone=${encodeURIComponent(phone)}&text=${encodeURIComponent(message)}`;
  
    try {
      await axios.get(url); // Faz a requisição HTTP
      console.log('Mensagem enviada para o WhatsApp:', phone);
    } catch (error) {
      console.error('Erro ao enviar mensagem para o WhatsApp:', error);
    }
  };

  const [timesAvailable, setTimesAvailable] = useState<string[]>([]);
  const services = ['Corte de Cabelo', 'Barba', 'Corte + Barba', 'Coloração'];

  const generateTimes = () => {
    let times = [];
    let hour = 10;
    let minutes = 0;
    while (hour < 20) {
      times.push(`${hour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`);
      minutes += 30;
      if (minutes >= 60) {
        hour++;
        minutes = 0;
      }
    }
    return times;
  };

  const times = generateTimes();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  useEffect(() => {
    const fetchReservedTimes = async () => {
      try {
        const reservedTimesSnapshot = await getDocs(query(
          collection(db, 'reservas'),
          where('date', '==', formData.date)
        ));
        const reservedTimes = reservedTimesSnapshot.docs.map(doc => doc.data().time);

        const today = new Date();
        const selectedDate = new Date(`${formData.date}T00:00:00`);

        let availableTimes = times.filter(time => !reservedTimes.includes(time));

        if (selectedDate.toDateString() === today.toDateString()) {
          const currentTime = today.getHours() * 60 + today.getMinutes();

          availableTimes = availableTimes.filter(time => {
            const [hour, minute] = time.split(':').map(Number);
            const timeInMinutes = hour * 60 + minute;
            return timeInMinutes > currentTime && timeInMinutes !== currentTime + 30;
          });
        }

        setTimesAvailable(availableTimes);
      } catch (error) {
        console.error('Erro ao buscar horários reservados:', error);
      }
    };

    if (formData.date) {
      fetchReservedTimes();
    } else {
      setTimesAvailable(times);
    }
  }, [formData.date]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const selectedDate = new Date(`${formData.date}T00:00:00`);
    const isSunday = selectedDate.getDay() === 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const isPastDate = selectedDate < today && !isSunday;

    const selectedTime = formData.time.split(':');
    const selectedDateTime = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate(),
      parseInt(selectedTime[0]), parseInt(selectedTime[1]));
    const isPastTime = selectedDateTime < new Date();

    if (isPastDate || isPastTime) {
      alert('Não é possível agendar para uma data ou horário passado.');
      return;
    }

    try {
      await addDoc(collection(db, "reservas"), {
        name: formData.name,
        phone: formData.phone,
        date: formData.date,
        service: formData.service,
        time: formData.time,
        createdAt: serverTimestamp()
      });

      const reservas = JSON.parse(localStorage.getItem('reservas') || '[]');
      reservas.push({
        name: formData.name,
        phone: formData.phone,
        date: formData.date,
        service: formData.service,
        time: formData.time,
        createdAt: new Date().toISOString()
      });
      localStorage.setItem('reservas', JSON.stringify(reservas));

      alert("Reserva realizada com sucesso!");
      setFormData({ name: '', phone: '', date: '', service: '', time: '' });
    } catch (error) {
      console.error("Erro ao adicionar a reserva: ", error);
      alert("Erro ao realizar a reserva. Tente novamente.");
    }
  };

  const todayDate = new Date().toISOString().split('T')[0];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-6">
      <h1 className="text-3xl text-black font-bold mb-8">Agende seu horário na barbearia</h1>
        <Reserve/>
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md"
      >
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
            Nome:
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full p-2 border rounded-lg text-black"
            required
          />
        </div>
  
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="phone">
            Telefone:
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="w-full p-2 border rounded-lg text-black"
            required
          />
        </div>
  
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="date">
            Data:
          </label>
          <input
            type="date"
            id="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            className="w-full p-2 border rounded-lg text-black"
            min={todayDate}
            required
          />
        </div>
  
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="service">
            Serviço:
          </label>
          <select
            id="service"
            name="service"
            value={formData.service}
            onChange={handleChange}
            className="w-full p-2 border rounded-lg text-black"
            required
          >
            <option value="">Selecione um serviço</option>
            {services.map((service, index) => (
              <option key={index} value={service}>{service}</option>
            ))}
          </select>
        </div>
  
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="time">
            Horário:
          </label>
          <select
            id="time"
            name="time"
            value={formData.time}
            onChange={handleChange}
            className="w-full p-2 border rounded-lg text-black"
            required
          >
            <option value="">Selecione um horário</option>
            {timesAvailable.map((time, index) => (
              <option key={index} value={time}>{time}</option>
            ))}
          </select>
        </div>
  
        <button
          type="submit"
          className="w-full bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 transition-colors"
        >
          Agendar
        </button>
      </form>
    </div>
  );
}