import { gql } from "@apollo/client"

export const UPDATE_CANVAS = gql`
    mutation UpdateCanvas($updateCanvasId: String!, $input: UpdateCanvas!) {
        updateCanvas(id: $updateCanvasId, input: $input) {
            objectId
            x1
            x2
            y1
            y2
            rect {
                top
                left
                angle
                circle {
                    top
                    left
                    branchText {
                        top
                        left
                        angle
                        connectionText {
                            top
                            left
                            angle
                        }
                    }
                }
            }
        }
    }
`

export const CREATE_BRANCH = gql`
    mutation Mutation($input: CreateCanvas!, $createCanvasId: String!) {
        createCanvas(input: $input, id: $createCanvasId) {
            id
            objectId
            x1
            x2
            y1
            y2
            rect {
                id
                objectId
                top
                left
                angle
                circle {
                    id
                    objectId
                    top
                    left
                    branchText {
                        id
                        objectId
                        textId
                        top
                        left
                        angle
                        text
                        connectionText {
                            id
                            objectId
                            textId
                            top
                            left
                            angle
                            text
                        }
                    }
                }
            }
        }
    }
`

export const UPDATE_BRANCH_TEXT = gql`
    mutation UpdateBranchText($input: UpdateBranchTextInput!) {
        updateBranchText(input: $input) {
            textId
            text
        }
    }
`

export const UPDATE_CONNECTION_TEXT = gql`
    mutation UpdateConnectionText($input: UpdateConnectionTextInput!) {
        updateConnectionText(input: $input) {
            id
            text
        }
    }
`

export const DELETE_BRANCH = gql`
    mutation Mutation($objectId: String!) {
        deleteCanvas(objectId: $objectId) {
            id
        }
    }
`

export const CREATE_HARNESS = gql`
    mutation CreateHarness($input: CreateHarness!) {
        harness(input: $input) {
            id
            projectId
            branches {
                id
                harnessId
                address
                value
                total
            }
        }
    }
`

export const RESET_HARNESS = gql`
    mutation Mutation($input: ResetHarness!, $canvas: [Type_Line!]!) {
        resetHarness(input: $input, canvas: $canvas) {
            id
        }
    }
`

export const RESET_HARNESS = gql`
    mutation Mutation($input: ResetHarness!, $canvas: [Type_Line!]!) {
        resetHarness(input: $input, canvas: $canvas) {
            id
        }
    }
`
