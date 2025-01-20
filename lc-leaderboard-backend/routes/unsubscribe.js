const express = require('express');
const validator = require('validator');
const router = express.Router();

module.exports = (pool) => {
    router.get('/', async (req, res) => {
        const { email, uuid } = req.query;
    
        if (!validator.isEmail(email)) {
            return res.status(400).json({ message: "Invalid email format" });
        }
        if (!uuid || typeof uuid !== "string") {
            return res.status(400).json({ message: "Invalid UUID format" });
        }
    
        try {
            const result = await pool.query(
                "DELETE FROM mailing_list WHERE email = $1 AND uuid = $2 RETURNING *",
                [email, uuid]
            );
    
            if (result.rowCount === 0) {
                return res.status(404).json({ message: "No matching subscription found" });
            }
    
            res.status(200).send("You have been successfully unsubscribed.");
        } catch (error) {
            res.status(500).json({ message: "An error occurred", error: error.message });
            console.error(error);
        }
    });
    
    return router;
};
