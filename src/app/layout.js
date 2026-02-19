const handleSubmit = async (e) => {
  e.preventDefault();

  const res = await fetch("/api/login", {
    method: "POST",
    body: JSON.stringify(form),
    headers: { "Content-Type": "application/json" }
  });

  const data = await res.json();

  if (res.ok) {
    router.push("/");
  }
};
