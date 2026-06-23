import { useState, useEffect, useCallback } from "react";
import axiosInstance from "../config/axiosInstance";
import { useAuth } from "../context/AuthContext";
import { formatDate, getStatusLabel } from "../utils/taskHelpers";

const ReadTaskModal = ({ task, onClose }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { token } = useAuth();

  const fetchHistory = useCallback(async () => {
    try {
      if (token && task?._id) {
        const res = await axiosInstance.get(`/tasks/${task._id}/history`);
        setHistory(res.data);
      }
    } catch (err) {
      setError("Failed to load task history.");
    } finally {
      setLoading(false);
    }
  }, [task?._id, token]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal read-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <span>Task Details (v{task.version || 1})</span>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>
        
        <div className="task-details-panel">
          <div className="detail-row">
            <span>Title:</span>
            <span>{task.title}</span>
          </div>
          {task.description && (
            <div className="detail-row">
              <span>Description:</span>
              <span>{task.description}</span>
            </div>
          )}
          <div className="detail-row">
            <span>Status:</span>
            <span className={`badge badge-${task.status}`}>{getStatusLabel(task.status)}</span>
          </div>
          <div className="detail-row">
            <span>Due Date:</span>
            <span>{formatDate(task.end_date) || "None"}</span>
          </div>
          <div className="detail-row">
            <span>Last Updated:</span>
            <span>{formatDate(task.updated_at)}</span>
          </div>
        </div>

        <h4 className="history-title">Version History</h4>
        <div className="history-list">
          {loading ? (
            <div className="history-loading">Loading history...</div>
          ) : error ? (
            <div className="history-error">{error}</div>
          ) : history.length === 0 ? (
            <div className="history-empty">No previous versions found.</div>
          ) : (
            history.map((ver) => (
              <div key={ver.id} className="history-item">
                <div className="history-header">
                  <span className="history-version">v{ver.version}</span>
                  <span className="history-date">{formatDate(ver.history_created_at || ver.updated_at)}</span>
                </div>
                <div className="history-body">
                  <p><strong>Title:</strong> {ver.title}</p>
                  {ver.description && <p><strong>Description:</strong> {ver.description}</p>}
                  <p>
                    <strong>Status:</strong>{" "}
                    <span className={`badge badge-${ver.status}`}>
                      {getStatusLabel(ver.status)}
                    </span>
                  </p>
                  <p><strong>Due:</strong> {formatDate(ver.end_date) || "None"}</p>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="modal-footer">
          <button className="btn-cancel" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

export default ReadTaskModal;
