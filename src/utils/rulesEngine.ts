// src/utils/rulesEngine.ts
// Rule engine for Thunderbird MCP server automation

import { promises as fs } from 'fs';
import * as path from 'path';
import rulesConfig from '../../automationRules.json';

// File path to rules config
const RULES_FILE_PATH = path.join(__dirname, '../../automationRules.json');

// Load rules from config
const loadRules = () => {
  return rulesConfig.rules;
};

// Save rules to file
const saveRules = async (rules: any[]) => {
  try {
    const config = { rules };
    await fs.writeFile(RULES_FILE_PATH, JSON.stringify(config, null, 2), 'utf-8');
    return { success: true };
  } catch (error) {
    console.error('Failed to save rules to file:', error);
    return { success: false, error: 'Failed to save rules to file' };
  }
};

// Apply rules to an email
export const applyRules = (email: any) => {
  const rules = loadRules();
  const appliedActions = [];

  for (const rule of rules) {
    const { condition, action } = rule;
    const { field, operator, value } = condition;

    // Evaluate condition
    let conditionMet = false;
    const emailValue = email[field];

    switch (operator) {
      case 'contains':
        conditionMet = typeof emailValue === 'string' && emailValue.includes(value);
        break;
      case 'equals':
        conditionMet = emailValue === value;
        break;
      // Add more operators as needed
      default:
        console.warn(`Unsupported operator: ${operator}`);
    }

    // Apply action if condition is met
    if (conditionMet) {
      appliedActions.push(action);
      console.log(`Applied rule: ${rule.id} → Action: ${action.type}`);
    }
  }

  return appliedActions;
};

// Add/update a rule
export const upsertRule = async (rule: any) => {
  const rules = loadRules();
  const existingIndex = rules.findIndex(r => r.id === rule.id);
  if (existingIndex >= 0) {
    rules[existingIndex] = rule;
  } else {
    rules.push(rule);
  }
  return await saveRules(rules);
};

// Delete a rule
export const deleteRule = async (ruleId: string) => {
  const rules = loadRules();
  const updatedRules = rules.filter(r => r.id !== ruleId);
  return await saveRules(updatedRules);
};

// Export loadRules for use in MCP tools
export const loadRulesExported = () => {
  return loadRules();
};
