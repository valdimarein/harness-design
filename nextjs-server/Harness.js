import { Canvas } from "./Canvas"
import { HarnessBranch } from "./HarnessBranch"
import { UploadToAws } from "./functions/UploadToAws"
import { extendType, inputObjectType, mutationField, nonNull, nullable, objectType, booleanArg, list } from "nexus"
import { prisma } from "../../lib/prisma"

export const Harness = objectType({
    name: "Harness",
    definition(t) {
        t.string("id")
        t.string("projectId")
        t.string("name")
        t.string("url")
        t.boolean("isOcr")
        t.boolean("isTemplate")
        t.list.field("branches", {
            type: HarnessBranch,
            async resolve(parent, _args, ctx) {
                return await ctx.prisma.HarnessBranch.findMany({
                    where: {
                        harnessId: parent.id,
                    },
                })
            },
        })
        t.list.field("canvas", {
            type: Canvas,
            async resolve(parent, _args, ctx) {
                return await ctx.prisma.Canvas.findMany({
                    where: {
                        harnessId: parent.id,
                    },
                })
            },
        })
    },
})

export const HarnessBranches = extendType({
    type: "Query",
    definition: (t) => {
        t.list.field("getHarness", {
            type: Harness,
            args: { isTemplate: nonNull(booleanArg()) },
            async resolve(_parent, args, ctx) {
                return await ctx.prisma.Harness.findMany({
                    where: {
                        isTemplate: {
                            equals: args.isTemplate,
                        },
                    },
                    include: {
                        canvas: true,
                    },
                })
            },
        })
    },
})

export const CreateHarness = inputObjectType({
    name: "CreateHarness",
    definition(t) {
        t.nonNull.string("projectId")
        t.nonNull.string("harnessId")
        t.nonNull.string("url")
        t.nonNull.string("name")
        t.nonNull.boolean("isOcr")
    },
})

export const createHarness = mutationField("harness", {
    type: nullable(Harness),
    args: { input: nonNull(CreateHarness) },
    resolve: async (_root, args, ctx) => {
        const url = await UploadToAws(args.input.url)

        await prisma.harnessBranch.deleteMany({
            where: {
                harnessId: args.input.harnessId,
            },
        })

        const data = await fetch(process.env.DJANGO_SERVER_URL + "/add/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                harnessId: args.input.harnessId,
                name: args.input.name,
                url: url,
                isOcr: args.input.isOcr,
            }),
        })
            .then((res) => res.json())
            .then((res) => {
                return res
            })
            .catch((error) => {
                console.log(error)
            })

        const { harnessId, branches } = data

        return await ctx.prisma.Harness.update({
            where: {
                id: harnessId,
            },
            data: {
                projectId: args.input.projectId,
                name: args.input.name,
                url: url,
                isTemplate: true,
                branches: {
                    createMany: {
                        data: branches,
                    },
                },
            },
            include: {
                branches: true,
            },
        })
    },
})

/** Type_ Inputs support nested structure of database **/
export const Type_ConnectionText = inputObjectType({
    name: "Type_ConnectionText",
    definition(t) {
        t.nullable.string("id")
        t.nullable.string("objectId")
        t.nullable.string("textId")
        t.nullable.float("left")
        t.nullable.float("top")
        t.nullable.string("text")
        t.nullable.float("angle")
    },
})

export const Type_BranchText = inputObjectType({
    name: "Type_BranchText",
    definition(t) {
        t.nullable.string("id")
        t.nullable.string("textId")
        t.nullable.string("objectId")
        t.nullable.float("left")
        t.nullable.float("top")
        t.nullable.string("text")
        t.nullable.float("angle")
        t.nullable.field("connectionText", { type: "Type_ConnectionText" })
    },
})

export const Type_Circle = inputObjectType({
    name: "Type_Circle",
    definition(t) {
        t.nullable.string("id")
        t.nullable.string("objectId")
        t.nullable.float("left")
        t.nullable.float("top")
        t.nullable.field("branchText", { type: "Type_BranchText" })
    },
})

export const Type_Rect = inputObjectType({
    name: "Type_Rect",
    definition(t) {
        t.nullable.string("id")
        t.nullable.string("objectId")
        t.nullable.float("left")
        t.nullable.float("top")
        t.nullable.float("angle")
        t.nullable.field("circle", { type: "Type_Circle" })
    },
})

export const Type_Line = inputObjectType({
    name: "Type_Line",
    definition(t) {
        t.nullable.string("id")
        t.nullable.string("objectId")
        t.nullable.float("x1")
        t.nullable.float("x2")
        t.nullable.float("y1")
        t.nullable.float("y2")
        t.nullable.field("rect", { type: "Type_Rect" })
    },
})

export const ResetHarness = inputObjectType({
    name: "ResetHarness",
    definition(t) {
        t.nonNull.string("harnessId")
        t.nonNull.string("canvasId")
    },
})

export const resetHarness = mutationField("resetHarness", {
    type: nullable(Harness),
    args: {
        input: nonNull(ResetHarness),
        canvas: nonNull(list(nonNull("Type_Line"))),
    },
    resolve: async (_root, args, ctx) => {
        await ctx.prisma.Line.deleteMany({
            where: {
                canvasId: args.input.canvasId,
            },
        })

        for (const item of args.canvas) {
            const rect = item.rect
            const circle = item.rect.circle
            const branchText = item.rect.circle.branchText
            const connectionText = item.rect.circle.branchText.connectionText

            await ctx.prisma.Line.create({
                data: {
                    canvasId: args.input.canvasId,
                    objectId: item.objectId,
                    x1: item.x1,
                    x2: item.x2,
                    y1: item.y1,
                    y2: item.y2,
                    rect: {
                        create: {
                            objectId: rect.objectId,
                            top: rect.top,
                            left: rect.left,
                            angle: rect.angle,
                            circle: {
                                create: {
                                    objectId: circle.objectId,
                                    top: circle.top,
                                    left: circle.left,
                                    branchText: {
                                        create: {
                                            objectId: branchText.objectId,
                                            textId: branchText.textId,
                                            top: branchText.top,
                                            left: branchText.left,
                                            angle: branchText.angle,
                                            text: branchText.text,
                                            connectionText: {
                                                create: {
                                                    objectId: connectionText.objectId,
                                                    textId: connectionText.textId,
                                                    top: connectionText.top,
                                                    left: connectionText.left,
                                                    angle: connectionText.angle,
                                                    text: connectionText.text,
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            })
        }
    },
})
