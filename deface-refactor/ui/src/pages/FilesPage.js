// frontend/src/pages/FilesPage.js
import React, { useState, useEffect } from 'react';
import { FileText, Search, Filter, Download, RefreshCw, Eye, Trash2, Server } from 'lucide-react';

const FilesPage = () => {
  const [files, setFiles] = useState([]);
  const [filteredFiles, setFilteredFiles] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterServer, setFilterServer] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedFiles, setSelectedFiles] = useState([]);

  // Mock data
  useEffect(() => {
    const mockFiles = [
      {
        id: 1,
        server: 'Production Server 1',
        path: '/var/www/html/index.php',
        fileName: 'index.php',
        changeType: 'modified',
        timestamp: '2024-03-15 14:32:15',
        size: '4.2 KB',
        hash: 'a3f5d8c9e2b1...',
        status: 'restored',
        autoRestored: true,
      },
      {
        id: 2,
        server: 'Production Server 1',
        path: '/var/www/html/config.php',
        fileName: 'config.php',
        changeType: 'modified',
        timestamp: '2024-03-15 14:15:08',
        size: '2.1 KB',
        hash: 'b7e4c1a9d3f2...',
        status: 'pending',
        autoRestored: false,
      },
      {
        id: 3,
        server: 'Staging Server',
        path: '/var/www/staging/shell.php',
        fileName: 'shell.php',
        changeType: 'added',
        timestamp: '2024-03-15 13:45:22',
        size: '8.5 KB',
        hash: 'c9d2e5b8f4a1...',
        status: 'deleted',
        autoRestored: true,
      },
      {
        id: 4,
        server: 'Development Server',
        path: '/var/www/dev/backup.sql',
        fileName: 'backup.sql',
        changeType: 'deleted',
        timestamp: '2024-03-15 13:20:45',
        size: '152 MB',
        hash: 'd4f1c8e9a2b5...',
        status: 'restored',
        autoRestored: false,
      },
      {
        id: 5,
        server: 'Production Server 1',
        path: '/var/www/html/.htaccess',
        fileName: '.htaccess',
        changeType: 'modified',
        timestamp: '2024-03-15 12:50:33',
        size: '1.8 KB',
        hash: 'e5a9d2c1f8b4...',
        status: 'restored',
        autoRestored: true,
      },
      {
        id: 6,
        server: 'Staging Server',
        path: '/var/www/staging/uploads/malware.exe',
        fileName: 'malware.exe',
        changeType: 'added',
        timestamp: '2024-03-15 12:18:09',
        size: '256 KB',
        hash: 'f1b8c5e9a2d4...',
        status: 'quarantined',
        autoRestored: true,
      },
      {
        id: 7,
        server: 'Production Server 1',
        path: '/var/www/html/admin/users.php',
        fileName: 'users.php',
        changeType: 'modified',
        timestamp: '2024-03-15 11:45:15',
        size: '6.7 KB',
        hash: 'a2c9e5d1b8f4...',
        status: 'pending',
        autoRestored: false,
      },
      {
        id: 8,
        server: 'Development Server',
        path: '/var/www/dev/test.php',
        fileName: 'test.php',
        changeType: 'added',
        timestamp: '2024-03-15 10:30:22',
        size: '3.4 KB',
        hash: 'b9d5c1e8a2f4...',
        status: 'allowed',
        autoRestored: false,
      },
    ];

    setFiles(mockFiles);
    setFilteredFiles(mockFiles);
  }, []);

  // Filter files
  useEffect(() => {
    let filtered = files;

    if (searchTerm) {
      filtered = filtered.filter(
        file =>
          file.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          file.path.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterServer !== 'all') {
      filtered = filtered.filter(file => file.server === filterServer);
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(file => file.status === filterStatus);
    }

    setFilteredFiles(filtered);
  }, [searchTerm, filterServer, filterStatus, files]);

  const getChangeTypeColor = (type) => {
    const colors = {
      modified: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      added: 'bg-green-100 text-green-800 border-green-200',
      deleted: 'bg-red-100 text-red-800 border-red-200',
    };
    return colors[type] || colors.modified;
  };

  const getStatusColor = (status) => {
    const colors = {
      restored: 'bg-green-100 text-green-800 border-green-200',
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      deleted: 'bg-red-100 text-red-800 border-red-200',
      quarantined: 'bg-purple-100 text-purple-800 border-purple-200',
      allowed: 'bg-blue-100 text-blue-800 border-blue-200',
    };
    return colors[status] || colors.pending;
  };

  const handleSelectFile = (fileId) => {
    setSelectedFiles(prev =>
      prev.includes(fileId)
        ? prev.filter(id => id !== fileId)
        : [...prev, fileId]
    );
  };

  const handleSelectAll = () => {
    if (selectedFiles.length === filteredFiles.length) {
      setSelectedFiles([]);
    } else {
      setSelectedFiles(filteredFiles.map(f => f.id));
    }
  };

  const handleRestoreSelected = () => {
    if (window.confirm(`Restore ${selectedFiles.length} selected file(s)?`)) {
      setFiles(prev =>
        prev.map(f =>
          selectedFiles.includes(f.id) ? { ...f, status: 'restored' } : f
        )
      );
      setSelectedFiles([]);
    }
  };

  const handleDeleteSelected = () => {
    if (window.confirm(`Delete ${selectedFiles.length} selected file(s)?`)) {
      setFiles(prev => prev.filter(f => !selectedFiles.includes(f.id)));
      setSelectedFiles([]);
    }
  };

  const servers = [...new Set(files.map(f => f.server))];

  const stats = {
    total: files.length,
    modified: files.filter(f => f.changeType === 'modified').length,
    added: files.filter(f => f.changeType === 'added').length,
    deleted: files.filter(f => f.changeType === 'deleted').length,
    restored: files.filter(f => f.status === 'restored').length,
  };

  return (
    <div>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl shadow-sm">
          <p className="text-sm text-gray-600 mb-1">Total Changes</p>
          <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm">
          <p className="text-sm text-gray-600 mb-1">Modified</p>
          <p className="text-2xl font-bold text-yellow-600">{stats.modified}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm">
          <p className="text-sm text-gray-600 mb-1">Added</p>
          <p className="text-2xl font-bold text-green-600">{stats.added}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm">
          <p className="text-sm text-gray-600 mb-1">Deleted</p>
          <p className="text-2xl font-bold text-red-600">{stats.deleted}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm">
          <p className="text-sm text-gray-600 mb-1">Restored</p>
          <p className="text-2xl font-bold text-blue-600">{stats.restored}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search files..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="relative">
            <Server className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              value={filterServer}
              onChange={(e) => setFilterServer(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
            >
              <option value="all">All Servers</option>
              {servers.map(server => (
                <option key={server} value={server}>{server}</option>
              ))}
            </select>
          </div>

          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="restored">Restored</option>
              <option value="deleted">Deleted</option>
              <option value="quarantined">Quarantined</option>
              <option value="allowed">Allowed</option>
            </select>
          </div>
        </div>

        {selectedFiles.length > 0 && (
          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <span className="text-sm text-gray-600">
              {selectedFiles.length} file(s) selected
            </span>
            <div className="flex gap-2">
              <button
                onClick={handleRestoreSelected}
                className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Restore
              </button>
              <button
                onClick={handleDeleteSelected}
                className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Files List */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {filteredFiles.length === 0 ? (
          <div className="text-center py-20">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">No file changes found</p>
          </div>
        ) : (
          <div>
            <div className="border-b border-gray-200 px-6 py-4 bg-gray-50">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedFiles.length === filteredFiles.length}
                  onChange={handleSelectAll}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <span className="text-sm font-medium text-gray-700">
                  Select All ({filteredFiles.length})
                </span>
              </label>
            </div>

            <div className="divide-y divide-gray-200">
              {filteredFiles.map((file) => (
                <div
                  key={file.id}
                  className={`p-6 hover:bg-gray-50 transition-colors ${
                    selectedFiles.includes(file.id) ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <input
                      type="checkbox"
                      checked={selectedFiles.includes(file.id)}
                      onChange={() => handleSelectFile(file.id)}
                      className="mt-1 w-4 h-4 text-blue-600 rounded"
                    />

                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <FileText className="w-5 h-5 text-blue-600" />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-semibold text-gray-800">{file.fileName}</h4>
                          <p className="text-sm text-gray-600 mt-1 font-mono">{file.path}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getChangeTypeColor(file.changeType)}`}>
                            {file.changeType}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(file.status)}`}>
                            {file.status}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-6 text-sm text-gray-500 mb-3">
                        <span>{file.server}</span>
                        <span>•</span>
                        <span>{file.size}</span>
                        <span>•</span>
                        <span>{file.timestamp}</span>
                        {file.autoRestored && (
                          <>
                            <span>•</span>
                            <span className="text-green-600 font-medium">Auto-Restored</span>
                          </>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <button className="px-3 py-1 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          View Diff
                        </button>
                        <button className="px-3 py-1 bg-green-600 text-white rounded text-sm font-medium hover:bg-green-700 transition-colors flex items-center gap-1">
                          <Download className="w-3 h-3" />
                          Download
                        </button>
                        {file.status === 'pending' && (
                          <button className="px-3 py-1 bg-purple-600 text-white rounded text-sm font-medium hover:bg-purple-700 transition-colors flex items-center gap-1">
                            <RefreshCw className="w-3 h-3" />
                            Restore
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FilesPage;
