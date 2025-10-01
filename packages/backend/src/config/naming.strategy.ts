import { DefaultNamingStrategy, NamingStrategyInterface } from 'typeorm';

export class CustomNamingStrategy extends DefaultNamingStrategy implements NamingStrategyInterface {
  // Override the column name generation to use the property name as-is
  columnName(propertyName: string, customName: string, embeddedPrefixes: string[]): string {
    // If a custom name is provided in the @Column decorator, use it
    if (customName) {
      return customName;
    }
    
    // Otherwise, use the property name as-is (don't convert to snake_case)
    return propertyName;
  }
}