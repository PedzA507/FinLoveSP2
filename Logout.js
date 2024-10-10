// Logout endpoint
app.post('/api/logout/:id', async (req, res) => {
    const { id } = req.params;
    const updateSql = "UPDATE User SET isActive = 1, loginAttempt = 0, lastAttemptTime = NULL WHERE UserId = ?";

    try {
        await db.promise().query(updateSql, [id]);
        res.send({ status: true, message: "Logged out successfully" });
    } catch (err) {
        console.error('Error during logout process:', err);
        res.status(500).send({ message: "Database update error", status: false });
    }
});