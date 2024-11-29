const mongoose = require("mongoose");

const systemStateSchema = new mongoose.Schema({
    remainingCredits: { type: Number, default: 100000 },
});

systemStateSchema.statics.getSystemState = async function () {
    let systemState = await this.findOne();
    if (!systemState) {
        systemState = await this.create({ remainingCredits: 100000 });
    }
    return systemState;
};

systemStateSchema.statics.decrementCredits = async function (amount) {
    const systemState = await this.getSystemState();
    if (systemState.remainingCredits < amount) {
        throw new Error("Insufficient system credits");
    }
    systemState.remainingCredits -= amount;
    await systemState.save();
};

const SystemState = mongoose.model("SystemState", systemStateSchema);

module.exports = SystemState;
