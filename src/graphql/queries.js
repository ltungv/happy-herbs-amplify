/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const getSensorsMeasurement = /* GraphQL */ `
  query GetSensorsMeasurement($thingsName: String!, $timestamp: Int!) {
    getSensorsMeasurement(thingsName: $thingsName, timestamp: $timestamp) {
      thingsName
      timestamp
      luxBH1750
      createdAt
      updatedAt
    }
  }
`;
export const listSensorsMeasurements = /* GraphQL */ `
  query ListSensorsMeasurements(
    $thingsName: String
    $timestamp: ModelIntKeyConditionInput
    $filter: ModelSensorsMeasurementFilterInput
    $limit: Int
    $nextToken: String
    $sortDirection: ModelSortDirection
  ) {
    listSensorsMeasurements(
      thingsName: $thingsName
      timestamp: $timestamp
      filter: $filter
      limit: $limit
      nextToken: $nextToken
      sortDirection: $sortDirection
    ) {
      items {
        thingsName
        timestamp
        luxBH1750
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;
