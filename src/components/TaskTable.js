import React, { useState, useEffect } from 'react';
import { Form, Input, Popconfirm, Table, Typography, Button } from 'antd';
import axios from 'axios';
import EditableCell from './EditableCell'; // Ensure EditableCell is imported correctly

const TaskTable = ({ tasks, users, statuses, onDelete }) => {
  const [form] = Form.useForm();
  const [data, setData] = useState([]);
  const [editingKey, setEditingKey] = useState('');

  const isEditing = (record) => record.key === editingKey;

  const edit = (record) => {
    form.setFieldsValue({ task: record.task, ...record });
    setEditingKey(record.key);
  };

  const cancel = () => {
    setEditingKey('');
  };

  const save = async (key) => {
    try {
      const row = await form.validateFields();
      const newData = [...data];
      const index = newData.findIndex((item) => key === item.key);

      if (index > -1) {
        const item = newData[index];
        const updatedItem = { ...item, task: row.task };

        await axios.put(`http://localhost:8080/api/userTask/updateUserTask/${key}`, {
          userId: item.userId,
          todoItemId: item.todoItemId,
          taskStatusId: item.taskStatusId,
          taskTitle: row.task,
          isActive: item.isActive,
        });

        newData.splice(index, 1, updatedItem);
        setData(newData);
        setEditingKey('');
      }
    } catch (errInfo) {
      console.log('Validate Failed:', errInfo);
    }
  };

  const deleteTask = async (key) => {
    try {
      await onDelete(key);
      const newData = data.filter((item) => item.key !== key);
      setData(newData);
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  useEffect(() => {
    const formattedData = tasks.map((task) => ({
      key: task.id,
      userId: task.user.id,
      todoItemId: task.todoItem.id,
      taskStatusId: task.taskStatus.id,
      task: task.taskTitle || task.todoItem.title,
      user: task.user.name,
      status: task.taskStatus.status,
      isActive: task.isActive,
    }));
    setData(formattedData);
  }, [tasks]);

  const columns = [
    {
      title: 'User',
      dataIndex: 'user',
      width: '30%',
    },
    {
      title: 'Task',
      dataIndex: 'task',
      width: '40%',
      editable: true,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      width: '20%',
    },
    {
      title: 'Operation',
      dataIndex: 'operation',
      render: (_, record) => (
        <span>
          {/* The Edit button has been removed */}
          <Popconfirm
            title="Are you sure to delete this task?"
            onConfirm={() => deleteTask(record.key)}
          >
            <Button type="link" danger>
              Delete
            </Button>
          </Popconfirm>
        </span>
      ),
    },
  ];
  

  const mergedColumns = columns.map((col) => {
    if (!col.editable) {
      return col;
    }

    return {
      ...col,
      onCell: (record) => ({
        record,
        inputType: col.dataIndex === 'task' ? 'text' : 'text',
        dataIndex: col.dataIndex,
        title: col.title,
        editing: isEditing(record),
        form,
      }),
    };
  });

  return (
    <Form form={form} component={false}>
      <Table
        components={{
          body: {
            cell: EditableCell,
          },
        }}
        bordered
        dataSource={data}
        columns={mergedColumns}
        rowClassName="editable-row"
        pagination={{
          onChange: cancel,
        }}
      />
    </Form>
  );
};

export default TaskTable;