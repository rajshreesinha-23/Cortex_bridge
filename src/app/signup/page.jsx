"use client";

import { useState } from "react";
import Link from "next/link";

export default function SignupPage() {

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: ""
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  console.log("FORM SUBMITTED");

    const res = await fetch("/api/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(formData)
    });

    const data = await res.json();

    alert(data.message);
  };

  return (
    <div className="p-10">
      <h1 className="text-2xl font-bold">Signup</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3 w-64">

        <input
          name="name"
          placeholder="Name"
          onChange={handleChange}
          className="border p-2"
        />

        <input
          name="email"
          placeholder="Email"
          onChange={handleChange}
          className="border p-2"
        />

        <input
          name="password"
          type="password"
          placeholder="Password"
          onChange={handleChange}
          className="border p-2"
        />

        <button className="bg-green-600 text-white p-2">
          Register
        </button>
        <button type="submit" className="bg-green-600 text-white p-2">
  Register
</button>


      </form>
    </div>
  );
}
