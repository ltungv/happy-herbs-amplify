/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const createSensorsMeasurement = /* GraphQL */ `
  mutation CreateSensorsMeasurement(
    $input: CreateSensorsMeasurementInput!
    $condition: ModelSensorsMeasurementConditionInput
  ) {
    createSensorsMeasurement(input: $input, condition: $condition) {
      thingsName
      timestamp
      luxBH1750
      createdAt
      updatedAt
    }
  }
`;
export const updateSensorsMeasurement = /* GraphQL */ `
  mutation UpdateSensorsMeasurement(
    $input: UpdateSensorsMeasurementInput!
    $condition: ModelSensorsMeasurementConditionInput
  ) {
    updateSensorsMeasurement(input: $input, condition: $condition) {
      thingsName
      timestamp
      luxBH1750
      createdAt
      updatedAt
    }
  }
`;
export const deleteSensorsMeasurement = /* GraphQL */ `
  mutation DeleteSensorsMeasurement(
    $input: DeleteSensorsMeasurementInput!
    $condition: ModelSensorsMeasurementConditionInput
  ) {
    deleteSensorsMeasurement(input: $input, condition: $condition) {
      thingsName
      timestamp
      luxBH1750
      createdAt
      updatedAt
    }
  }
`;
