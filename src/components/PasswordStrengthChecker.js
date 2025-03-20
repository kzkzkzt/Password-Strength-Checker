import React, { useState } from "react";

const PasswordStrengthChecker = () => {
	const [password, setPassword] = useState("");
	const [strength, setStrength] = useState(null);
	const [breachCount, setBreachCount] = useState(null);
	const [loading, setLoading] = useState(false);

	// Function to handle form submission
	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		try {
			const response = await fetch(
				"https://flask-backend-password-strength-checker.onrender.com/check-password",
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({ password }),
				}
			);

			const data = await response.json();
			setStrength(data.strength);
			setBreachCount(data.breach_count);
		} catch (error) {
			console.error("Error:", error);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div>
			<h2>Password Strength Checker</h2>
			<form onSubmit={handleSubmit}>
				<input
					type="password"
					placeholder="Enter your password"
					value={password}
					onChange={(e) => setPassword(e.target.value)}
					required
				/>
				<button type="submit" disabled={loading}>
					{loading ? "Checking..." : "Check Password"}
				</button>
			</form>

			{strength !== null && (
				<div>
					<p>Password Strength: {strength}</p>
					<p>Breached {breachCount} times</p>
				</div>
			)}
		</div>
	);
};

export default PasswordStrengthChecker;
