import { useContext } from "react";
import { GameSettingsContext } from "../context/GameSettingsContext";

export default function useGameSetting() {
  return useContext(GameSettingsContext);
}
