import { createContext, useState } from "react";
import { customAlphabet } from 'nanoid';
import { TIMEMODES, WHITE } from "../constants/constants";
import { getTimeDetailsFromMode } from "../utils/CommonFunctions";

export const GameSettingsContext = createContext();

export const GameSettingsProvider = ({ children }) => {
    const listOfAlphabets = `ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789`;
    const generateRoomId = customAlphabet(listOfAlphabets, 6);

    const defaultGameSettings = {
        id: generateRoomId(),
        mode: 1,
        color: WHITE,
        timeMode: TIMEMODES.BLITZ,
        time: getTimeDetailsFromMode(TIMEMODES.BLITZ),
    }
    const [setting, setSetting] = useState(defaultGameSettings);
    const updateSetting = (newSetting = {}) => {
        setSetting((setting) => ({ ...setting, ...newSetting }));
    }
    const getSetting = () => {
        return setting;
    }
    const value = {
        updateSetting,
        getSetting
    }
    return <GameSettingsContext.Provider value={value}>{children}</GameSettingsContext.Provider>;
}