import React, { useState } from 'react'
import { readFile, writeFile, executeCommand, executeShell, readAbsolute, deleteFile } from '../api'

// INSECURE (intentional): This component intentionally demonstrates unsafe file and command operations
// against the backend demo endpoints. These are for educational/security-scanning purposes only.
export default function Files({ token }) {
  const [filename, setFilename] = useState('')
  const [fileContent, setFileContent] = useState('')
  const [output, setOutput] = useState('')
  const [cmd, setCmd] = useState('')
  const [shellInput, setShellInput] = useState('')
  const [absPath, setAbsPath] = useState('')

  const doRead = async () => {
    setOutput('Loading...')
    try {
      const res = await readFile(filename, token)
      setOutput(res)
    } catch (err) {
      setOutput(String(err))
    }
  }

  const doWrite = async () => {
    setOutput('Writing...')
    try {
      const res = await writeFile(filename, fileContent, token)
      setOutput(res)
    } catch (err) {
      setOutput(String(err))
    }
  }

  const doExec = async () => {
    setOutput('Running...')
    try {
      const res = await executeCommand(cmd, token)
      setOutput(res)
    } catch (err) {
      setOutput(String(err))
    }
  }

  const doShell = async () => {
    setOutput('Running shell...')
    try {
      const res = await executeShell(shellInput, token)
      setOutput(res)
    } catch (err) {
      setOutput(String(err))
    }
  }

  const doReadAbs = async () => {
    setOutput('Loading...')
    try {
      const res = await readAbsolute(absPath, token)
      setOutput(res)
    } catch (err) {
      setOutput(String(err))
    }
  }

  const doDelete = async () => {
    setOutput('Deleting...')
    try {
      const res = await deleteFile(filename, token)
      setOutput(res)
    } catch (err) {
      setOutput(String(err))
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">File & Command Demo (INSECURE)</h2>

      <div className="grid grid-cols-2 gap-6 mb-6">
        <div className="card">
          <h3 className="font-semibold mb-2">Read file (path traversal demo)</h3>
          <div className="flex gap-2 mb-2">
            <input className="flex-1 p-2 border rounded" placeholder="filename (e.g. ../application.properties)" value={filename} onChange={e => setFilename(e.target.value)} />
            <button className="px-3 py-2 bg-blue-600 text-white rounded" onClick={doRead}>Read</button>
          </div>
          <h3 className="font-semibold mb-2">Read absolute path</h3>
          <div className="flex gap-2 mb-2">
            <input className="flex-1 p-2 border rounded" placeholder="absolute path (e.g. C:\\Windows\\system.ini)" value={absPath} onChange={e => setAbsPath(e.target.value)} />
            <button className="px-3 py-2 bg-blue-600 text-white rounded" onClick={doReadAbs}>Read</button>
          </div>

          <h3 className="font-semibold mb-2">Write file</h3>
          <textarea className="w-full p-2 border rounded mb-2" rows={4} placeholder="file contents" value={fileContent} onChange={e => setFileContent(e.target.value)} />
          <div className="flex gap-2">
            <input className="flex-1 p-2 border rounded" placeholder="filename" value={filename} onChange={e => setFilename(e.target.value)} />
            <button className="px-3 py-2 bg-amber-500 text-white rounded" onClick={doWrite}>Write</button>
            <button className="px-3 py-2 bg-red-500 text-white rounded" onClick={doDelete}>Delete</button>
          </div>
        </div>

        <div className="card">
          <h3 className="font-semibold mb-2">Execute command (command injection demo)</h3>
          <div className="flex gap-2 mb-2">
            <input className="flex-1 p-2 border rounded" placeholder="command (unsafe)" value={cmd} onChange={e => setCmd(e.target.value)} />
            <button className="px-3 py-2 bg-red-600 text-white rounded" onClick={doExec}>Execute</button>
          </div>

          <h3 className="font-semibold mb-2">Execute shell input (unsafe)</h3>
          <div className="flex gap-2 mb-2">
            <input className="flex-1 p-2 border rounded" placeholder="shell input" value={shellInput} onChange={e => setShellInput(e.target.value)} />
            <button className="px-3 py-2 bg-red-600 text-white rounded" onClick={doShell}>Run Shell</button>
          </div>

          <h3 className="font-semibold mb-2">Response</h3>
          <pre className="whitespace-pre-wrap bg-gray-100 p-3 rounded h-64 overflow-auto">{output}</pre>
        </div>
      </div>
    </div>
  )
}
