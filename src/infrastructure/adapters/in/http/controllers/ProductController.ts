import { Request, Response } from 'express'
import { CreateProductUseCase } from '@application/product/use-cases/CreateProductUseCase'
import { ListProductsUseCase } from '@application/product/use-cases/ListProductsUseCase'
import { GetProductByIdUseCase } from '@application/product/use-cases/GetProductByIdUseCase'
import { UpdateProductPriceUseCase } from '@application/product/use-cases/UpdateProductPriceUseCase'
import { ToggleProductAvailabilityUseCase } from '@application/product/use-cases/ToggleProductAvailabilityUseCase'
import { CreateProductSchema, UpdateProductPriceSchema } from '../dtos/product.dto'
import { Product, ProductCategory } from '@domain/product'
import { DomainError } from '@shared/kernel'

export class ProductController {
  constructor(
    private readonly createProduct: CreateProductUseCase,
    private readonly listProducts: ListProductsUseCase,
    private readonly getProductById: GetProductByIdUseCase,
    private readonly updateProductPrice: UpdateProductPriceUseCase,
    private readonly toggleProductAvailability: ToggleProductAvailabilityUseCase
  ) {}

  async create(req: Request, res: Response): Promise<void> {
    const parsed = CreateProductSchema.parse(req.body)
    const input = {
      name: parsed.name,
      description: parsed.description ?? '',
      price: parsed.price,
      currency: parsed.currency,
      category: parsed.category,
      available: parsed.available,
      ...(parsed.imageUrl !== undefined ? { imageUrl: parsed.imageUrl } : {}),
    }
    const product = await this.createProduct.execute(input)
    res.status(201).json(this.toProductResponse(product))
  }

  async list(req: Request, res: Response): Promise<void> {
    const category = req.query['category']
    const onlyAvailable = req.query['available'] === 'true'
    const input: { category?: ProductCategory; onlyAvailable?: boolean } = { onlyAvailable }
    if (typeof category === 'string') {
      input.category = category as ProductCategory
    }
    const products = await this.listProducts.execute(input)
    res.json(products.map(this.toProductResponse))
  }

  async getById(req: Request, res: Response): Promise<void> {
    const product = await this.getProductById.execute({ id: this.getParamId(req) })
    res.json(this.toProductResponse(product))
  }

  async updatePrice(req: Request, res: Response): Promise<void> {
    const parsed = UpdateProductPriceSchema.parse(req.body)
    const product = await this.updateProductPrice.execute({
      id: this.getParamId(req),
      price: parsed.price,
      currency: parsed.currency,
    })
    res.json(this.toProductResponse(product))
  }

  async toggleAvailability(req: Request, res: Response): Promise<void> {
    const product = await this.toggleProductAvailability.execute({ id: this.getParamId(req) })
    res.json(this.toProductResponse(product))
  }

  private getParamId(req: Request): string {
    const id = req.params['id']
    if (!id) {
      throw new DomainError('INVALID_ID', 'Missing id parameter')
    }
    return id
  }

  private toProductResponse(product: Product) {
    return {
      id: product.id.value,
      name: product.name,
      description: product.description,
      price: {
        amount: product.price.amount,
        currency: product.price.currency,
      },
      category: product.category,
      available: product.available,
      imageUrl: product.imageUrl,
    }
  }
}