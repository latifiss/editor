export interface NotificationItem {
    id: number;
    text: string;
    style?: string;
  }
  
  export const remove = (arr: NotificationItem[], item: NotificationItem): NotificationItem[] => {
    const newArr = [...arr];
    const index = newArr.findIndex((i) => i.id === item.id);
    if (index !== -1) newArr.splice(index, 1);
    return newArr;
  };
  
  let newIndex = 0;
  
  export const add = (
    arr: NotificationItem[],
    text: string,
    style?: string
  ): NotificationItem[] => {
    newIndex += 1;
    return [...arr, { id: newIndex, text, style }];
  };
  