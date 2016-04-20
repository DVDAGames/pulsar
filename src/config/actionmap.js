import ActionList from './actionlist';

const ActionMap = {
  gamepad: {
    [ActionList[0]]: [12],
    [ActionList[1]]: [13],
    [ActionList[2]]: [14],
    [ActionList[3]]: [15],
    [ActionList[4]]: [1],
    [ActionList[5]]: [2],
    [ActionList[6]]: [0],
    [ActionList[7]]: [9],
  },
  keyboard: {
    [ActionList[0]]: ['ArrowUp'],
    [ActionList[1]]: ['ArrowDown'],
    [ActionList[2]]: ['ArrowLeft'],
    [ActionList[3]]: ['ArrowRight'],
    [ActionList[4]]: ['Digit1'],
    [ActionList[5]]: ['Digit2'],
    [ActionList[6]]: ['Space'],
    [ActionList[7]]: ['Escape'],
    [ActionList[8]]: ['Enter']
  }
};

export default ActionMap;
