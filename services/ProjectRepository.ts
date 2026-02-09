
import { SavedProject, CalculatorState } from '../types';

const STORAGE_KEY = 'dream_home_projects';

export class ProjectRepository {
  static getAll(): SavedProject[] {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    try {
      return JSON.parse(data);
    } catch (e) {
      console.error('Failed to parse projects', e);
      return [];
    }
  }

  static save(name: string, state: CalculatorState, total: number, id?: string): SavedProject {
    const projects = this.getAll();
    const newProject: SavedProject = {
      id: id || crypto.randomUUID(),
      name,
      timestamp: Date.now(),
      state,
      total
    };

    const index = projects.findIndex(p => p.id === newProject.id);
    if (index > -1) {
      projects[index] = newProject;
    } else {
      projects.push(newProject);
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
    return newProject;
  }

  static delete(id: string): void {
    const projects = this.getAll().filter(p => p.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  }

  static getById(id: string): SavedProject | undefined {
    return this.getAll().find(p => p.id === id);
  }
}
