from django.conf import settings
from models import Image, Branch, BranchConnection, Harness

base_cwd = settings.MEDIA_ROOT

# Below is the function called from the API View. Each class calls a series of functions from the __init__ to transform the data.

def run_image_to_harness(harnessId, name, url, isOcr, cwd):
    file_path = base_cwd + "/base_harness.png"

    image = Image(harnessId=harnessId, name=name, url=url, file_path=file_path, cwd=cwd)

    data = image.create_lookups()

    harnessId, offset, image_dim, lookups = data.harnessId, data.offset, data.image_dim, data.matches

    branches = []
    connections = []
    for item in lookups:
        imageId, typeof, file_name, file_path, topLeft, bottomRight, address = item.values()

        if typeof == "Branch":
            branch = Branch(
                imageId=imageId,
                isOcr=isOcr,
                file_name=file_name,
                file_path=file_path,
                topLeft=topLeft,
                bottomRight=bottomRight,
                offset=offset,
                address=address,
                image_dim=image_dim
            )
            data = branch.create_harness()

            branches.append({
                "branchId": data.branchId,
                "topLeft": data.topLeft,
                "bottomRight": data.bottomRight,
                "client_address": data.client_address,
                "address": data.address,
                "children": data.children,
                "parent": data.parent,
                "total": data.total,
                "lines": data.generated_lines,
            })

        if typeof == "Connection":
            connection = BranchConnection(
                imageId=imageId,
                isOcr=isOcr,
                file_name=file_name,
                file_path=file_path,
                topLeft=topLeft,
                bottomRight=bottomRight
            )

            data = connection.create_harness()

            connections.append({
                "connectionId": data.connectionId,
                "topLeft": data.topLeft,
                "bottomRight": data.bottomRight,
                "branch_value": data.branch_value
            })

    harness = Harness(harnessId=harnessId, branches=branches, connections=connections)

    return harness.return_harness()
