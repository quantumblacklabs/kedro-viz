# Copyright 2021 QuantumBlack Visual Analytics Limited
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
# http://www.apache.org/licenses/LICENSE-2.0
#
# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
# EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
# OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND
# NONINFRINGEMENT. IN NO EVENT WILL THE LICENSOR OR OTHER CONTRIBUTORS
# BE LIABLE FOR ANY CLAIM, DAMAGES, OR OTHER LIABILITY, WHETHER IN AN
# ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF, OR IN
# CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
#
# The QuantumBlack Visual Analytics Limited ("QuantumBlack") name and logo
# (either separately or in combination, "QuantumBlack Trademarks") are
# trademarks of QuantumBlack. The License does not grant you any right or
# license to the QuantumBlack Trademarks. You may not use the QuantumBlack
# Trademarks or any confusingly similar mark as a trademark for your product,
#     or use the QuantumBlack Trademarks in any other manner that might cause
# confusion in the marketplace, including but not limited to in advertising,
# on websites, or on software.
#
# See the License for the specific language governing permissions and
# limitations under the License.
"""`kedro_viz.api.responses` defines API response types"""
# pylint: disable=missing-class-docstring,too-few-public-methods
import abc
from typing import Dict, List, Optional, Union

from pydantic import BaseModel
from kedro_viz.data_access import data_access_manager
from kedro_viz.models.graph import ModularPipeline


class APIErrorMessage(BaseModel):
    message: str


class BaseAPIResponse(BaseModel, abc.ABC):
    class Config:
        orm_mode = True


class BaseGraphNodeAPIResponse(BaseAPIResponse):
    id: str
    name: str
    full_name: str
    tags: List[str]
    pipelines: List[str]
    modular_pipelines: List[str]
    type: str


class TaskNodeAPIResponse(BaseGraphNodeAPIResponse):
    parameters: Dict

    class Config:
        schema_extra = {
            "example": {
                "id": "6ab908b8",
                "name": "split_data_node",
                "full_name": "split_data_node",
                "tags": [],
                "pipelines": ["__default__", "ds"],
                "modular_pipelines": [],
                "type": "task",
                "parameters": {
                    "test_size": 0.2,
                    "random_state": 3,
                    "features": [
                        "engines",
                        "passenger_capacity",
                        "crew",
                        "d_check_complete",
                        "moon_clearance_complete",
                        "iata_approved",
                        "company_rating",
                        "review_scores_rating",
                    ],
                },
            }
        }


class TaskNodeMetadataAPIResponse(BaseAPIResponse):
    code: str
    filepath: str
    parameters: Dict

    class Config:
        schema_extra = {
            "example": {
                "code": "def split_data(data: pd.DataFrame, parameters: Dict) -> Tuple:",
                "filepath": "proj/src/new_kedro_project/pipelines/data_science/nodes.py",
                "parameters": {"test_size": 0.2,},
            }
        }


class DataNodeMetadataAPIResponse(BaseAPIResponse):
    filepath: str
    type: str

    class Config:
        schema_extra = {
            "example": {
                "filepath": "/my-kedro-project/data/03_primary/master_table.csv",
                "type": "kedro.extras.datasets.pandas.csv_dataset.CSVDataSet",
            }
        }


class ParametersNodeMetadataAPIResponse(BaseAPIResponse):
    parameters: Dict

    class Config:
        schema_extra = {
            "example": {
                "parameters": {
                    "test_size": 0.2,
                    "random_state": 3,
                    "features": [
                        "engines",
                        "passenger_capacity",
                        "crew",
                        "d_check_complete",
                        "moon_clearance_complete",
                        "iata_approved",
                        "company_rating",
                        "review_scores_rating",
                    ],
                }
            }
        }


NodeMetadataAPIResponse = Union[
    TaskNodeMetadataAPIResponse,
    DataNodeMetadataAPIResponse,
    ParametersNodeMetadataAPIResponse,
]


class DataNodeAPIResponse(BaseGraphNodeAPIResponse):
    layer: Optional[str]

    class Config:
        schema_extra = {
            "example": {
                "id": "d7b83b05",
                "name": "Master Table",
                "full_name": "master_table",
                "tags": [],
                "pipelines": ["__default__", "dp", "ds"],
                "modular_pipelines": [],
                "type": "data",
                "layer": "primary",
            }
        }


class GraphEdgeAPIResponse(BaseAPIResponse):
    source: str
    target: str


class NamedEntityAPIResponse(BaseAPIResponse):
    id: str
    name: Optional[str]


class GraphAPIResponse(BaseAPIResponse):
    nodes: List[
        Union[
            TaskNodeAPIResponse, DataNodeAPIResponse, ParametersNodeMetadataAPIResponse
        ]
    ]
    edges: List[GraphEdgeAPIResponse]
    tags: List[str]
    layers: List[str]
    pipelines: List[NamedEntityAPIResponse]
    modular_pipelines: List[NamedEntityAPIResponse]
    selected_pipeline: str


def get_default_response() -> GraphAPIResponse:
    """Default response for `/api/main`.
    """
    return GraphAPIResponse(
        nodes=data_access_manager.nodes.as_list(),
        edges=data_access_manager.edges.as_list(),
        tags=data_access_manager.tags.as_list(),
        layers=data_access_manager.layers.as_list(),
        pipelines=data_access_manager.registered_pipelines.as_list(),
        modular_pipelines=data_access_manager.modular_pipelines.as_list(),
        selected_pipeline=data_access_manager.get_default_selected_pipeline().id,
    )
