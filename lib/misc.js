class MiscLib {
    async wait(milliseconds) {
        await new Promise((resolve) => {
            setTimeout(resolve,milliseconds);
        });
    }
}

export const libMisc = new MiscLib();