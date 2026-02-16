import { useState, useEffect, useCallback, useMemo } from 'react';
import * as api from '../services/api';

export const useLists = () => {
  const [lists, setLists] = useState([]);
  const [selectedListId, setSelectedListId] = useState('my-day');
  const [myDayDbId, setMyDayDbId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchLists = useCallback(async () => {
    try {
      const allLists = await api.getLists();
      const defaultList = allLists.find((l) => l.is_default);
      setMyDayDbId(defaultList?.id ?? null);
      setLists(allLists.filter((list) => !list.is_default));
      setIsLoading(false);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLists();
  }, [fetchLists]);

  const resolveListId = useCallback(
    (listId) => (listId === 'my-day' ? myDayDbId : listId),
    [myDayDbId]
  );

  const createList = useCallback(async (name) => {
    try {
      const newList = await api.createList(name);
      setLists((prev) => [...prev, newList]);
      setSelectedListId(newList.id);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    }
  }, []);

  const updateList = useCallback(async (listId, newName) => {
    try {
      const updatedList = await api.updateList(listId, newName);
      setLists((prev) => prev.map((list) => (list.id === listId ? updatedList : list)));
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    }
  }, []);

  const deleteList = useCallback(
    async (listId) => {
      try {
        await api.deleteList(listId);
        setLists((prev) => prev.filter((list) => list.id !== listId));
        if (selectedListId === listId) {
          setSelectedListId('my-day');
        }
      } catch (err) {
        setError(err.response?.data?.error || err.message);
      }
    },
    [selectedListId]
  );

  const selectedList = useMemo(() => {
    if (selectedListId === 'my-day') {
      return { id: 'my-day', name: 'My Day', isDefault: true };
    }
    if (selectedListId === 'important') {
      return { id: 'important', name: 'Important Tasks', isSpecial: true };
    }
    return lists.find((l) => l.id === selectedListId);
  }, [selectedListId, lists]);

  return {
    lists,
    selectedListId,
    setSelectedListId,
    selectedList,
    resolveListId,
    createList,
    updateList,
    deleteList,
    isLoading,
    error,
    setError,
  };
};
