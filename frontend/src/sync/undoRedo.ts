export interface Command {
  execute: () => void
  undo: () => void
  description: string
}

export class UndoRedoManager {
  private undoStack: Command[] = []
  private redoStack: Command[] = []

  get canUndo() { return this.undoStack.length > 0 }
  get canRedo() { return this.redoStack.length > 0 }

  execute(cmd: Command) { cmd.execute(); this.undoStack.push(cmd); this.redoStack = [] }
  undo() { const cmd = this.undoStack.pop(); if (cmd) { cmd.undo(); this.redoStack.push(cmd) } }
  redo() { const cmd = this.redoStack.pop(); if (cmd) { cmd.execute(); this.undoStack.push(cmd) } }
  clear() { this.undoStack = []; this.redoStack = [] }
}

export const undoRedoManager = new UndoRedoManager()
