const SystemState = require("../models/systemStateModel");
const { logOperation } = require("./blockchainController");

exports.getSystemCredits = async () => {
    try {
        const systemState = await SystemState.getSystemState();
        return systemState.remainingCredits;
    } catch (error) {
        console.error("Error fetching system credits:", error.message);
        throw new Error("Could not fetch system credits");
    }
};

exports.decrementSystemCredits = async (userId, amount) => {
    try {
        await SystemState.decrementCredits(amount);
        await logOperation("System Credits Decrement", userId, amount);

        console.log("System credits decremented by", amount);
    } catch (error) {
        console.error("Error decrementing system credits:", error.message);
        throw new Error("Could not decrement system credits");
    }
};
